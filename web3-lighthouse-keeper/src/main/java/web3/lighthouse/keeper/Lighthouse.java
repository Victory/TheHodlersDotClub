package web3.lighthouse.keeper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.http.HttpService;
import org.web3j.utils.Convert;
import web3.lighthouse.keeper.config.Config;
import web3.lighthouse.keeper.config.ConfigUtils;
import web3.lighthouse.keeper.model.CoinData;
import web3.lighthouse.keeper.model.CoinMarketCapCoinData;
import web3.lighthouse.keeper.sol.PriceInUsdLighthouse;

import java.math.BigInteger;
import java.nio.file.Paths;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class Lighthouse {
  private static final Logger log = LoggerFactory.getLogger(Lighthouse.class);

  public static void main(String[] args) throws Exception {
    String password = "this is my password for test net";

    String walletFile = Paths.get("test-wallet-file.txt").toAbsolutePath().toString();
    log.info("Wallet file path: " + walletFile);

    Config config = ConfigUtils.getConfig();

    Web3j web3 = Web3j.build(new HttpService(config.rpcUrl));
    log.info("Web3ClientVersion: " + web3.web3ClientVersion().send().getWeb3ClientVersion());

    Credentials credentials = WalletUtils.loadCredentials(password, walletFile);
    log.info("Wallet Address: " + credentials.getAddress());

    log.info("Lighthouse Address: " + config.contractAddress);

    BigInteger gasLimit = new BigInteger("100000");

    PriceInUsdLighthouse lighthouse =
      PriceInUsdLighthouse.load(config.contractAddress, web3, credentials, BigInteger.ZERO, gasLimit);

    @SuppressWarnings("unchecked")
    List<String> keepers = lighthouse.getKeepers().send();

    if (!keepers.contains(credentials.getAddress())) {
      System.out.println("You are not a keeper. Exiting.");
      System.out.println("Current Keepers:");
      keepers.forEach(System.out::println);
      System.exit(1);
    }

    Timer timer = new Timer();
    PriceFetcher priceFetcher = new PriceFetcher(config);
    GetAndPushPrice getAndPushPrice = new GetAndPushPrice(priceFetcher, lighthouse);
    int period = config.poolingIntervalInSeconds * 1000;
    timer.schedule(getAndPushPrice, 0, period);
  }

  private static class GetAndPushPrice extends TimerTask {
    private final PriceFetcher priceFetcher;
    private final PriceInUsdLighthouse lighthouse;
    private int count = 0;

    private static final BigInteger STARTING_GAS_PRICE = Convert.toWei("30", Convert.Unit.GWEI).toBigInteger();
    private static final BigInteger MAX_GAS_PRICE = Convert.toWei("80", Convert.Unit.GWEI).toBigInteger();
    private static BigInteger GAS_PRICE_INCREMENT = Convert.toWei("5", Convert.Unit.GWEI).toBigInteger();

    GetAndPushPrice(PriceFetcher priceFetcher, PriceInUsdLighthouse lighthouse) {
      this.priceFetcher = priceFetcher;
      this.lighthouse = lighthouse;
    }

    @Override
    public void run() {
      count += 1;

      String jsonString = priceFetcher.fetch();
      if (jsonString == null) {
        System.out.println("Failed to fetch: " + count);
        return;
      }

      CoinData coinData = CoinMarketCapCoinData.fromJson(jsonString);
      System.out.print("Pushing Price: " + coinData.getPrice() + " ... ");

      BigInteger gasPrice = STARTING_GAS_PRICE;
      while (gasPrice.compareTo(MAX_GAS_PRICE) < 0) {
        lighthouse.setGasPrice(gasPrice);

        try {
          lighthouse.setPrice(coinData.getPrice()).send();
        } catch (Exception e) {

          if (e.getMessage().contains("Transaction with the same hash was already imported.")) {
            log.warn("Warning: skipping with error: " + e.getMessage() );
            return;
          }

          if (e.getMessage().contains("Transaction receipt was not generated after")) {
            log.warn("Warning: Could not find transaction, assuming it will show up later.");
            return;
          }

          sleep();
          System.out.println("Error: " + e.getMessage());
          gasPrice = gasPrice.add(GAS_PRICE_INCREMENT);
          System.out.println("Incrementing Gas Price: " + gasPrice.longValue());
          continue;
        }

        System.out.println("pushed");
        return;
      }
    }

    private void sleep() {
      try {
        Thread.sleep(60000);
      } catch (InterruptedException e) {
        throw new RuntimeException(e);
      }
    }
  }
}

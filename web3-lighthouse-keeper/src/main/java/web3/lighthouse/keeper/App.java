package web3.lighthouse.keeper;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.web3j.crypto.CipherException;
import org.web3j.crypto.Credentials;
import org.web3j.crypto.WalletUtils;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.exceptions.TransactionException;
import org.web3j.protocol.http.HttpService;
import org.web3j.tx.ManagedTransaction;
import org.web3j.tx.Transfer;
import org.web3j.utils.Convert;
import web3.lighthouse.keeper.config.Config;
import web3.lighthouse.keeper.config.ConfigUtils;
import web3.lighthouse.keeper.model.CoinData;
import web3.lighthouse.keeper.model.CoinMarketCapCoinData;
import web3.lighthouse.keeper.sol.PriceInUsdLighthouse;
import web3.lighthouse.keeper.tx.NonceManager;

import java.io.IOException;
import java.math.BigDecimal;
import java.math.BigInteger;
import java.nio.file.Paths;
import java.util.List;
import java.util.Timer;
import java.util.TimerTask;

public class App {
  private static final Logger log = LoggerFactory.getLogger(App.class);

  public static void main(String[] args) throws Exception {
    String password = "this is my password for test net";

    String walletFile = Paths.get("test-wallet-file.txt").toAbsolutePath().toString();
    log.info("Wallet file path: " + walletFile);

    Config config = ConfigUtils.getConfig();

    Web3j web3 = Web3j.build(new HttpService(config.rpcUrl));
    log.info("Web3ClientVersion: " + web3.web3ClientVersion().send().getWeb3ClientVersion());

    Credentials credentials = WalletUtils.loadCredentials(password, walletFile);
    credentials.getAddress();

    BigInteger gasPrice = Convert.toWei("3", Convert.Unit.GWEI).toBigInteger();
    BigInteger gasLimit = new BigInteger("100000");

    PriceInUsdLighthouse lighthouse =
      PriceInUsdLighthouse.load(config.contractAddress, web3, credentials, gasPrice, gasLimit);

    List<String> keepers = lighthouse.getKeepers().send();
    System.out.println("Current Keepers");
    keepers.stream().forEach(System.out::println);

    if (!keepers.contains(credentials.getAddress())) {
      System.out.println("You are not a keeper. Exiting.");
      System.exit(1);
    }

    Timer timer = new Timer();
    PriceFetcher priceFetcher = new PriceFetcher(config);
    GetAndPushPrice getAndPushPrice = new GetAndPushPrice(priceFetcher, lighthouse);
    int period = config.poolingIntervalInSeconds * 1000;
    timer.schedule(getAndPushPrice, 0, period);
  }

  private static class GetAndPushPrice extends TimerTask {
    private final PriceFetcher priceFeatcher;
    private final PriceInUsdLighthouse lighthouse;
    private int count = 0;

    public GetAndPushPrice(PriceFetcher priceFetcher, PriceInUsdLighthouse lighthouse) {
      this.priceFeatcher = priceFetcher;
      this.lighthouse = lighthouse;
    }

    @Override
    public void run() {
      count += 1;
      //System.out.println("Running: " + count);

      String jsonString = priceFeatcher.fetch();
      if (jsonString == null) {
        System.out.println("Failed to fetch: " + count);
        return;
      }

      CoinData coinData = CoinMarketCapCoinData.fromJson(jsonString);
      System.out.println("Price: " + coinData.getPrice());

      BigInteger gasPrice = Convert.toWei("30", Convert.Unit.GWEI).toBigInteger();
      lighthouse.setGasPrice(gasPrice);

      try {
        lighthouse.setPrice(coinData.getPrice()).send();
      } catch (Exception e) {
        BigInteger increment = Convert.toWei("80", Convert.Unit.GWEI).toBigInteger();
        lighthouse.setGasPrice(lighthouse.getGasPrice().add(increment));

        try {
          lighthouse.setPrice(coinData.getPrice()).send();
        } catch (Exception e1) {
          e1.printStackTrace();
        }
      }
    }
  }
}

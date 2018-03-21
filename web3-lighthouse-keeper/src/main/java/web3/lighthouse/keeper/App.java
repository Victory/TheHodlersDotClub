package web3.lighthouse.keeper;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import web3.lighthouse.keeper.config.Config;
import web3.lighthouse.keeper.config.ConfigUtils;
import web3.lighthouse.keeper.model.CoinData;
import web3.lighthouse.keeper.model.CoinMarketCapCoinData;

import java.io.IOException;
import java.util.Timer;
import java.util.TimerTask;

public class App {
  public static void main(String[] args) {
    System.out.println("Hello");

    Config config = ConfigUtils.getConfig();


    Timer timer = new Timer();
    PriceFetcher priceFetcher = new PriceFetcher(config);
    GetAndPushPrice getAndPushPrice = new GetAndPushPrice(priceFetcher);
    int period = config.poolingIntervalInSeconds * 1000;
    timer.schedule(getAndPushPrice, 0, period);
  }

  private static class PriceFetcher {

    private final Config config;

    private PriceFetcher(Config config) {
      this.config = config;
    }

    public String fetch() {
      OkHttpClient okHttpClient = new OkHttpClient();
      Request request = new Request.Builder()
        .url(config.apiUrl)
        .build();

      try {
        Response response = okHttpClient.newCall(request).execute();
        String body = response.body().string();
        System.out.println(body);

        return body;
      } catch (IOException e) {
        e.printStackTrace();
        return null;
      }
    }
  }

  private static class GetAndPushPrice extends TimerTask {
    private final PriceFetcher priceFeatcher;
    private int count = 0;

    public GetAndPushPrice(PriceFetcher priceFetcher) {
      this.priceFeatcher = priceFetcher;
    }

    @Override
    public void run() {
      count += 1;
      System.out.println("Running: " + count);

      String jsonString = priceFeatcher.fetch();
      if (jsonString == null) {
        System.out.println("Failed to fetch: " + count);
        return;
      }

      CoinData coinData = CoinMarketCapCoinData.fromJson(jsonString);
      System.out.println("Price: " + coinData.getPrice());
    }
  }
}

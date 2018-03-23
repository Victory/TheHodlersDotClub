package web3.lighthouse.keeper;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import web3.lighthouse.keeper.config.Config;

import java.io.IOException;

class PriceFetcher {

  private final Config config;

  PriceFetcher(Config config) {
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
      //System.out.println(body);

      return body;
    } catch (IOException e) {
      e.printStackTrace();
      return null;
    }
  }
}

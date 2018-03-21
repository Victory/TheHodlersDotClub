package web3.lighthouse.keeper.config;

import web3.lighthouse.keeper.config.Config;

public class ConfigUtils {

  public static Config getConfig() {

    String password = "";
    boolean isEncrypted = false;
    String publicKey = "";
    String privateKey = "";
    String apiUrl = "https://api.coinmarketcap.com/v1/ticker/pirl/?convert=USD";
    String priceJsonKey = "price_usd";
    int poolingIntervalInSeconds = 10;

    return new Config(password, isEncrypted, publicKey, privateKey, apiUrl, priceJsonKey, poolingIntervalInSeconds);
  }
}

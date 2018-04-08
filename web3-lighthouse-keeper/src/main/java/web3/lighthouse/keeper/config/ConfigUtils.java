package web3.lighthouse.keeper.config;

public class ConfigUtils {

  /**
   * Ropsten
   *
   * wallet password: this is my password for test net
   */
  public static Config getConfig() {

    String rpcUrl = "http://node.kickthecoin.com/ropsten";
    String contractAddress = "0xdd3a294310dbd8b53feee7ca1e1205062fe5d066";
    String apiUrl = "https://api.coinmarketcap.com/v1/ticker/pirl/?convert=USD";
    String priceJsonKey = "price_usd";
    int poolingIntervalInSeconds = 800;

    return new Config(rpcUrl, apiUrl, priceJsonKey, poolingIntervalInSeconds, contractAddress);
  }
}

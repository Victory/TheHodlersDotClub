package web3.lighthouse.keeper.config;

public class Config {
  public final String contractAddress;
  public final String apiUrl;
  public final String priceJsonKey;
  public final int poolingIntervalInSeconds;
  public final String rpcUrl;

  public Config(
    String rpcUrl, String apiUrl, String priceJsonKey, int poolingIntervalInSeconds, String contractAddress) {
    this.rpcUrl = rpcUrl;
    this.contractAddress = contractAddress;
    this.apiUrl = apiUrl;
    this.priceJsonKey = priceJsonKey;
    this.poolingIntervalInSeconds = poolingIntervalInSeconds;
  }
}

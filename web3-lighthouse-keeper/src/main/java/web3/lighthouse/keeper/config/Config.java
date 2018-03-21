package web3.lighthouse.keeper.config;

public class Config {
  public final String password;
  public final boolean isEncrypted;
  public final String publicKey;
  public final String privateKey;
  public final String apiUrl;
  public final String priceJsonKey;
  public final int poolingIntervalInSeconds;

  public Config(
    String password,
    boolean isEncrypted,
    String publicKey,
    String privateKey,
    String apiUrl,
    String priceJsonKey, int poolingIntervalInSeconds) {
    this.password = password;
    this.isEncrypted = isEncrypted;
    this.publicKey = publicKey;
    this.privateKey = privateKey;
    this.apiUrl = apiUrl;
    this.priceJsonKey = priceJsonKey;
    this.poolingIntervalInSeconds = poolingIntervalInSeconds;
  }
}

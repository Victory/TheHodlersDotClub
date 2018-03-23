package web3.lighthouse.keeper.model;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.List;

public class CoinMarketCapCoinData implements CoinData {

  @SerializedName("price_usd")
  private String price;

  public BigInteger getPrice() {
    return new BigInteger("" + Math.round(Float.parseFloat(price) * 100));
  }

  public static CoinData fromJson(String jsonString) {
    Type listType = new TypeToken<ArrayList<CoinMarketCapCoinData>>(){}.getType();
    Gson gson = new Gson();
    List<CoinMarketCapCoinData> results = gson.fromJson(jsonString, listType);
    return results.get(0);
  }

  @Override
  public String toString() {
    return "The price is: " + price;
  }
}

package web3.lighthouse.keeper.tx;

import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;
import org.web3j.protocol.core.methods.response.EthGetTransactionCount;

import java.math.BigInteger;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;

public class NonceManager {

  private static final Map<String, BigInteger> addressToLastNonce = new ConcurrentHashMap<>();

  private final Web3j web3;

  public NonceManager(Web3j web3) {
    this.web3 = web3;
  }

  /** Get nonce for the current address (blocking) */
  public BigInteger get(String address) {

    addressToLastNonce.putIfAbsent(address, new BigInteger("0"));

    EthGetTransactionCount count;
    try {
      count = web3.ethGetTransactionCount(address, DefaultBlockParameterName.LATEST)
        .sendAsync()
        .get();
    } catch (InterruptedException | ExecutionException e) {
      throw new RuntimeException(e);
    }

    BigInteger result = count.getTransactionCount();
    BigInteger lastNonce = addressToLastNonce.putIfAbsent(address, result);
    if (lastNonce != null) {
      int compared = lastNonce.compareTo(result);
      if (compared == 0) {
        addressToLastNonce.put(address, result.add(new BigInteger("1")));
      } else if (compared == 1) {
        addressToLastNonce.put(address, lastNonce.add(new BigInteger("1")));
      }
    }

    return addressToLastNonce.get(address);
  }
}

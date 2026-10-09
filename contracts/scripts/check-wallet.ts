import { ethers } from 'ethers';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const pk = process.env.MONAD_PRIVATE_KEY;
  if (!pk) {
    console.error('❌ MONAD_PRIVATE_KEY tidak ada di .env');
    process.exit(1);
  }
  
  const provider = new ethers.JsonRpcProvider('https://testnet-rpc.monad.xyz');
  const wallet = new ethers.Wallet(pk, provider);
  
  console.log('Wallet address:', wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log('Balance:', ethers.formatEther(balance), 'MON');
  
  const network = await provider.getNetwork();
  console.log('Chain ID:', network.chainId);
}

main().catch(console.error);
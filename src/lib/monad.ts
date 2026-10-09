import { ethers } from 'ethers';

const MONAD_RPC_URL = process.env.MONAD_RPC_URL || 'https://testnet-rpc.monad.xyz';
const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_NADIPASS_REGISTRY_ADDRESS || '';
const PRIVATE_KEY = process.env.MONAD_PRIVATE_KEY || '';

const ABI = [
    'function registerIdentity(bytes32 patientIdHash, bytes32 profileHash, address owner) external',
    'function logBreakGlass(bytes32 patientIdHash, bytes32 eventHash, uint8 reasonCode) external',
    'function getPatientProfile(bytes32 patientIdHash) external view returns (bytes32)',
    'function getPatientOwner(bytes32 patientIdHash) external view returns (address)',
    'function getBreakGlassCount(bytes32 patientIdHash) external view returns (uint256)',
];

const REASON_CODES: Record<string, number> = {
    IGD: 0,
    AMBULANS: 1,
    EVENT: 2,
    LAINNYA: 3,
};

export async function logIdentityOnChain(patientId: string, profileHash: string): Promise<string | null> {
    try {
        if (!PRIVATE_KEY || !REGISTRY_ADDRESS) {
            console.warn('[monad] Skip: env not set');
            return null;
        }
        const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(REGISTRY_ADDRESS, ABI, wallet);

        const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes(patientId));
        const profileHashBytes = ethers.keccak256(ethers.toUtf8Bytes(profileHash));

        const tx = await contract.registerIdentity(patientIdHash, profileHashBytes, wallet.address);
        const receipt = await tx.wait();
        console.log('[monad] Identity logged on-chain:', receipt?.hash);
        return receipt?.hash || null;
    } catch (err) {
        console.error('[monad] Identity log failed:', err);
        return null;  // JANGAN blocking
    }
}

export async function logBreakGlassOnChain(patientId: string, eventHash: string, reason: string): Promise<string | null> {
    try {
        if (!PRIVATE_KEY || !REGISTRY_ADDRESS) {
            console.warn('[monad] Skip: env not set');
            return null;
        }
        const provider = new ethers.JsonRpcProvider(MONAD_RPC_URL);
        const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
        const contract = new ethers.Contract(REGISTRY_ADDRESS, ABI, wallet);

        const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes(patientId));
        const eventHashBytes = ethers.keccak256(ethers.toUtf8Bytes(eventHash));
        const reasonCode = REASON_CODES[reason] ?? 3;

        const tx = await contract.logBreakGlass(patientIdHash, eventHashBytes, reasonCode);
        const receipt = await tx.wait();
        console.log('[monad] Break-glass logged on-chain:', receipt?.hash);
        return receipt?.hash || null;
    } catch (err) {
        console.error('[monad] Break-glass log failed:', err);
        return null;  // JANGAN blocking
    }
}
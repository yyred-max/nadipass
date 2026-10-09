import { ethers } from "hardhat";

async function main() {
    console.log("🚀 Deploying NadiPassRegistry to Monad testnet...");

    const Registry = await ethers.getContractFactory("NadiPassRegistry");
    const registry = await Registry.deploy();
    await registry.waitForDeployment();

    const address = await registry.getAddress();
    console.log("✅ NadiPassRegistry deployed to:", address);
    console.log("📋 Explorer:", `https://testnet.monadexplorer.com/address/${address}`);

    // Test: register dummy identity
    console.log("\n📝 Testing registerIdentity...");
    const patientIdHash = ethers.keccak256(ethers.toUtf8Bytes("test-patient-1"));
    const profileHash = ethers.keccak256(ethers.toUtf8Bytes("test-profile-1"));
    const [deployer] = await ethers.getSigners();

    const tx = await registry.registerIdentity(patientIdHash, profileHash, deployer.address);
    const receipt = await tx.wait();
    console.log("✅ Test identity registered!");
    console.log("   Tx hash:", receipt?.hash);
    console.log("   Explorer:", `https://testnet.monadexplorer.com/tx/${receipt?.hash}`);

    // Test: log break-glass
    console.log("\n📝 Testing logBreakGlass...");
    const eventHash = ethers.keccak256(ethers.toUtf8Bytes("test-event-1"));
    const tx2 = await registry.logBreakGlass(patientIdHash, eventHash, 0);
    const receipt2 = await tx2.wait();
    console.log("✅ Test break-glass logged!");
    console.log("   Tx hash:", receipt2?.hash);
    console.log("   Explorer:", `https://testnet.monadexplorer.com/tx/${receipt2?.hash}`);

    console.log("\n🎉 Deploy selesai!");
    console.log("\n📌 Copy ke .env.local project utama:");
    console.log(`NEXT_PUBLIC_NADIPASS_REGISTRY_ADDRESS=${address}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
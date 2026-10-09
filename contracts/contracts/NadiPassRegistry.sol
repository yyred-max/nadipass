// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * NadiPassRegistry
 *
 * Audit trail + identity registry untuk NadiPass.
 *
 * PENTING:
 * - HANYA menyimpan hash (patientIdHash, profileHash, eventHash)
 * - TIDAK ADA data medis (alergi, obat, penyakit)
 * - TIDAK ADA PII (nama, HP, alamat)
 * - Append-only: log tidak bisa dihapus
 */
contract NadiPassRegistry {
    // patientIdHash -> profileHash (hash dari profil pasien)
    mapping(bytes32 => bytes32) public patientProfiles;

    // patientIdHash -> wallet owner
    mapping(bytes32 => address) public patientOwners;

    // patientIdHash -> jumlah break-glass
    mapping(bytes32 => uint256) public breakGlassCount;

    // Events untuk audit
    event IdentityRegistered(
        bytes32 indexed patientIdHash,
        bytes32 profileHash,
        address indexed owner,
        uint256 timestamp
    );

    event BreakGlassLogged(
        bytes32 indexed patientIdHash,
        bytes32 indexed eventHash,
        uint8 reasonCode,  // 0=IGD, 1=AMBULANS, 2=EVENT, 3=LAINNYA
        uint256 timestamp
    );

    /**
     * Register identity pasien (hash saja)
     */
    function registerIdentity(
        bytes32 patientIdHash,
        bytes32 profileHash,
        address owner
    ) external {
        require(patientOwners[patientIdHash] == address(0), "Already registered");
        patientProfiles[patientIdHash] = profileHash;
        patientOwners[patientIdHash] = owner;
        emit IdentityRegistered(patientIdHash, profileHash, owner, block.timestamp);
    }

    /**
     * Log break-glass event (append-only)
     * reasonCode: 0=IGD, 1=AMBULANS, 2=EVENT, 3=LAINNYA
     */
    function logBreakGlass(
        bytes32 patientIdHash,
        bytes32 eventHash,
        uint8 reasonCode
    ) external {
        require(patientOwners[patientIdHash] != address(0), "Patient not registered");
        breakGlassCount[patientIdHash] += 1;
        emit BreakGlassLogged(patientIdHash, eventHash, reasonCode, block.timestamp);
    }

    // View functions
    function getPatientProfile(bytes32 patientIdHash) external view returns (bytes32) {
        return patientProfiles[patientIdHash];
    }

    function getPatientOwner(bytes32 patientIdHash) external view returns (address) {
        return patientOwners[patientIdHash];
    }

    function getBreakGlassCount(bytes32 patientIdHash) external view returns (uint256) {
        return breakGlassCount[patientIdHash];
    }
}

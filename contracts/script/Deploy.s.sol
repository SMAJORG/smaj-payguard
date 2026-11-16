// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Script} from "forge-std/Script.sol";
import {PayGuardEscrow} from "../src/PayGuardEscrow.sol";

contract Deploy is Script {
    function run() external returns (PayGuardEscrow deployed) {
        address token = vm.envAddress("TUSD8_ADDRESS");
        vm.startBroadcast();
        deployed = new PayGuardEscrow(token);
        vm.stopBroadcast();
    }
}

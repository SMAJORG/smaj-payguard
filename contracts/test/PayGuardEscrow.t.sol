// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {Test} from "forge-std/Test.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {PayGuardEscrow} from "../src/PayGuardEscrow.sol";

contract MockUSD is ERC20 {
    constructor() ERC20("Test USD", "tUSD8") {}
    function decimals() public pure override returns (uint8) { return 6; }
    function mint(address to, uint256 amount) external { _mint(to, amount); }
}

contract PayGuardEscrowTest is Test {
    MockUSD internal usd;
    PayGuardEscrow internal escrow;
    address internal payer = address(0xA11CE);
    address internal merchant = address(0xB0B);
    uint256 internal constant AMOUNT = 250_000_000;
    uint64 internal deadline;

    function setUp() public {
        usd = new MockUSD();
        escrow = new PayGuardEscrow(address(usd));
        usd.mint(payer, 1_000_000_000);
        vm.prank(payer);
        usd.approve(address(escrow), type(uint256).max);
        deadline = uint64(block.timestamp + 1 days);
    }

    function _fund() internal returns (uint256 id) {
        vm.prank(payer);
        id = escrow.fund(merchant, AMOUNT, deadline);
    }

    function testFundAndRelease() public {
        uint256 id = _fund();
        assertEq(usd.balanceOf(address(escrow)), AMOUNT);
        vm.prank(payer);
        escrow.release(id);
        assertEq(usd.balanceOf(merchant), AMOUNT);
        assertEq(usd.balanceOf(address(escrow)), 0);
        (, , , , PayGuardEscrow.Status status) = escrow.invoices(id);
        assertEq(uint256(status), uint256(PayGuardEscrow.Status.Released));
    }

    function testRefundAfterDeadline() public {
        uint256 id = _fund();
        vm.warp(uint256(deadline));
        vm.prank(payer);
        escrow.refund(id);
        assertEq(usd.balanceOf(payer), 1_000_000_000);
        assertEq(usd.balanceOf(address(escrow)), 0);
    }

    function testCannotRefundEarly() public {
        uint256 id = _fund();
        vm.expectRevert(PayGuardEscrow.TooEarly.selector);
        vm.prank(payer);
        escrow.refund(id);
    }

    function testUnauthorizedCannotReleaseOrRefund() public {
        uint256 id = _fund();
        vm.expectRevert(PayGuardEscrow.Unauthorized.selector);
        vm.prank(merchant);
        escrow.release(id);
        vm.warp(uint256(deadline));
        vm.expectRevert(PayGuardEscrow.Unauthorized.selector);
        vm.prank(merchant);
        escrow.refund(id);
    }

    function testCannotReleaseTwice() public {
        uint256 id = _fund();
        vm.startPrank(payer);
        escrow.release(id);
        vm.expectRevert(PayGuardEscrow.InvalidInvoice.selector);
        escrow.release(id);
        vm.stopPrank();
    }

    function testCannotReleaseAfterRefund() public {
        uint256 id = _fund();
        vm.warp(uint256(deadline));
        vm.startPrank(payer);
        escrow.refund(id);
        vm.expectRevert(PayGuardEscrow.InvalidInvoice.selector);
        escrow.release(id);
        vm.stopPrank();
    }

    function testRejectsInvalidInvoice() public {
        vm.startPrank(payer);
        vm.expectRevert(PayGuardEscrow.InvalidParameters.selector);
        escrow.fund(address(0), AMOUNT, deadline);
        vm.expectRevert(PayGuardEscrow.InvalidParameters.selector);
        escrow.fund(merchant, 0, deadline);
        vm.expectRevert(PayGuardEscrow.InvalidParameters.selector);
        escrow.fund(payer, AMOUNT, deadline);
        vm.expectRevert(PayGuardEscrow.InvalidParameters.selector);
        escrow.fund(merchant, AMOUNT, uint64(block.timestamp));
        vm.stopPrank();
    }

    function testInsufficientAllowanceReverts() public {
        vm.prank(payer);
        usd.approve(address(escrow), 0);
        vm.expectRevert();
        vm.prank(payer);
        escrow.fund(merchant, AMOUNT, deadline);
        assertEq(escrow.nextInvoiceId(), 0);
    }
}

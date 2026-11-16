// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/// @notice Testnet-only payer-controlled escrow; does not verify legal identity.
contract PayGuardEscrow is ReentrancyGuard {
    using SafeERC20 for IERC20;
    enum Status { None, Funded, Released, Refunded }
    struct Invoice {
        address payer;
        address recipient;
        uint256 amount;
        uint64 refundAfter;
        Status status;
    }
    IERC20 public immutable token;
    uint256 public nextInvoiceId;
    mapping(uint256 => Invoice) public invoices;
    event InvoiceFunded(uint256 indexed id, address indexed payer, address indexed recipient, uint256 amount, uint64 refundAfter);
    event InvoiceReleased(uint256 indexed id);
    event InvoiceRefunded(uint256 indexed id);
    error InvalidParameters();
    error InvalidInvoice();
    error Unauthorized();
    error TooEarly();

    constructor(address tokenAddress) {
        if (tokenAddress == address(0)) revert InvalidParameters();
        token = IERC20(tokenAddress);
    }

    function fund(address recipient, uint256 amount, uint64 refundAfter) external nonReentrant returns (uint256 id) {
        if (recipient == address(0) || recipient == msg.sender || amount == 0 || refundAfter <= block.timestamp) revert InvalidParameters();
        id = ++nextInvoiceId;
        invoices[id] = Invoice(msg.sender, recipient, amount, refundAfter, Status.Funded);
        token.safeTransferFrom(msg.sender, address(this), amount);
        emit InvoiceFunded(id, msg.sender, recipient, amount, refundAfter);
    }

    function release(uint256 id) external nonReentrant {
        Invoice storage invoice = invoices[id];
        if (invoice.status != Status.Funded) revert InvalidInvoice();
        if (msg.sender != invoice.payer) revert Unauthorized();
        invoice.status = Status.Released;
        token.safeTransfer(invoice.recipient, invoice.amount);
        emit InvoiceReleased(id);
    }

    function refund(uint256 id) external nonReentrant {
        Invoice storage invoice = invoices[id];
        if (invoice.status != Status.Funded) revert InvalidInvoice();
        if (msg.sender != invoice.payer) revert Unauthorized();
        if (block.timestamp < invoice.refundAfter) revert TooEarly();
        invoice.status = Status.Refunded;
        token.safeTransfer(invoice.payer, invoice.amount);
        emit InvoiceRefunded(id);
    }
}

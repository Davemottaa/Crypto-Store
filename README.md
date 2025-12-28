# 🛒 Crypto Store | Web3 E-Commerce

![Project Status](https://img.shields.io/badge/status-active-success)
![License](https://img.shields.io/badge/license-MIT-blue)
![Web3](https://img.shields.io/badge/Web3-Integration-orange)

> A high-conversion landing page focused on electronics, featuring full Blockchain integration (Ethereum/Sepolia) for payments via Smart Contracts (ERC-20).

## 🖼️ About the Project

This project simulates a **Native-Web3** e-commerce store. Unlike conventional stores that use payment gateways (Stripe, PayPal), **Crypto Store** interacts directly with the blockchain through the user's wallet (MetaMask).

The goal was to create a fluid User Experience (UX), where Web3 complexities (network switching, approvals, decimal conversion) are abstracted into a friendly and modern interface.

### ✨ Key Features

* **Responsive & Modern Design:** Mobile-First layout, *Scroll Reveal* animations, and "Glassmorphism" aesthetic (Dark Mode).
* **Wallet Connection:** Login via MetaMask (Web3 Injection).
* **Network Enforcer:** Automatically detects and forces a switch to the **Sepolia Testnet**.
* **ERC-20 Payments:** Full logic to accept Tokens (e.g., USDT) by interacting directly with the Token Contract ABI.
* **Visual Feedback:** Toast notification system for transaction status (Pending, Success, Error).
* **Error Handling:** Manages signature rejections and RPC failures gracefully.

---

## 🛠️ Tech Stack

* **HTML5 Semantic:** Accessible structure optimized for SEO.
* **CSS3 (Modern):** CSS Variables, Flexbox, Grid Layout, and Media Queries.
* **JavaScript (ES6+):** Async logic (`async/await`) and DOM manipulation.
* **[Ethers.js v6](https://docs.ethers.org/v6/):** Library for interacting with the Ethereum Blockchain.
* **[Toastify JS](https://apvarun.github.io/toastify-js/):** Non-intrusive notifications for better UX.

---

## 🚀 How to Run

Since this project uses **Vanilla JS** and CDN libraries, no heavy Node.js dependencies are required to run it locally.

### Prerequisites
1.  Browser with **MetaMask** extension installed.
2.  **Live Server** extension (VS Code) or any simple local server.

### Steps

1.  Clone the repository:
    ```bash
    git clone [https://github.com/YOUR-USERNAME/crypto-store.git](https://github.com/YOUR-USERNAME/crypto-store.git)
    ```
2.  Open the folder in VS Code.
3.  **Wallet Setup:**
    * Open `script.js`.
    * Locate the line `const MERCHANT_ADDRESS`.
    * Replace it with **YOUR** public wallet address (where you want to receive the test payments).
4.  Open `index.html` with Live Server.
5.  Access `http://127.0.0.1:5500` in your browser.

---

## 🧪 How to Test Payments (Demo Mode)

This project is configured to run on the **Sepolia Testnet** (fake money) for safety.

1.  **Get Test ETH:** Go to a [Sepolia Faucet](https://sepoliafaucet.com/) and request free ETH to pay for gas fees.
2.  **Get Test USDT:**
    * In MetaMask (Sepolia Network), click "Import Token".
    * Add the contract address used in the code: `0x7169D38820dfd117C3FA1f22a697dBA58d90BA06`.
    * Use an ERC-20 Faucet to mint some balance of this token.
3.  **On the Website:**
    * Click **Connect Wallet**.
    * Choose a product and click **Buy with Crypto**.
    * Approve and Confirm the transaction in MetaMask.

---

## 📂 File Structure

crypto-store/ │ ├── index.html # Structure and Content ├── style.css # Styling (Dark Theme & Responsive) ├── script.js # Web3 Logic (Ethers.js) & UI └── README.md # Documentation


---

## 🧠 Web3 Logic (Snippet)

Below is an example of how the Frontend calculates precise values for the Smart Contract, avoiding common floating-point errors in blockchain development:

```javascript
// Ethers.js v6 interaction example
const tokenContract = new ethers.Contract(USDT_ADDRESS, ABI, signer);
const decimals = await tokenContract.decimals(); // Returns 6 for USDT

// Converts visual price (450.00) to BigInt (450000000) safely
const amountToPay = ethers.parseUnits(price.toString(), decimals);

// Executes the transfer on the Blockchain
await tokenContract.transfer(MERCHANT_ADDRESS, amountToPay);
🔮 Future Improvements (Roadmap)
[ ] Create a custom Store Smart Contract (Solidity) for on-chain stock management.

[ ] Add multi-chain support (Polygon, BSC, Arbitrum).

[ ] User purchase history reading events from the Blockchain.

📄 License
This project is licensed under the MIT License. Feel free to use it for study and portfolio purposes.

Developed by Davi Mota 🚀
document.addEventListener('DOMContentLoaded', () => {
    
    // ============================================
    // 0. CONFIGURATION (MARKET SETUP)
    // ============================================
    
    // 1. MERCHANT WALLET: Where the money goes.
    // REPLACE with your wallet address!
    const MERCHANT_ADDRESS = "0x5B38Da6a701c568545dCfcB03FcB875f56beddC4"; 

    // 2. TOKEN CONTRACT ADDRESS (USDT on Sepolia Testnet)
    // This is a "Fake USDT" contract for testing. 
    // On Mainnet (Real Life), use USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
    const USDT_CONTRACT_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06"; 

    // 3. TARGET NETWORK: Sepolia Testnet
    // Chain ID 11155111 in Hex is 0xaa36a7
    const TARGET_CHAIN_ID = '0xaa36a7'; 

    // 4. ABI (Application Binary Interface)
    // This tells JS how to talk to the Token Contract
    const ERC20_ABI = [
        "function transfer(address to, uint amount) returns (bool)",
        "function decimals() view returns (uint8)",
        "function balanceOf(address owner) view returns (uint256)",
        "function symbol() view returns (string)"
    ];


    // ============================================
    // 1. UI & ANIMATIONS (Pure Frontend)
    // ============================================
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const navLinksItems = document.querySelectorAll('.nav-links li a');

    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        const icon = hamburger.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    navLinksItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            hamburger.querySelector('i').classList.remove('fa-times');
            hamburger.querySelector('i').classList.add('fa-bars');
        });
    });

    // Header Glassmorphism
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.boxShadow = "0 4px 20px rgba(0,0,0,0.4)";
            header.style.background = "rgba(15, 23, 42, 0.95)";
        } else {
            header.style.boxShadow = "none";
            header.style.background = "rgba(15, 23, 42, 0.9)";
        }
    });

    // Scroll Reveal Animation
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));


    // ============================================
    // 2. UTILITY FUNCTIONS (UX)
    // ============================================

    function showToast(message, type = "info") {
        let background = "linear-gradient(to right, #0f172a, #334155)";
        
        if (type === "success") background = "linear-gradient(to right, #00b09b, #96c93d)";
        if (type === "error") background = "linear-gradient(to right, #ff5f6d, #ffc371)";
        if (type === "warning") background = "linear-gradient(to right, #f2994a, #f2c94c)";

        Toastify({
            text: message,
            duration: 4000,
            close: true,
            gravity: "top",
            position: "right",
            style: {
                background: background,
                borderRadius: "10px",
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 4px 15px rgba(0,0,0,0.3)"
            },
        }).showToast();
    }


    // ============================================
    // 3. WEB3 INTEGRATION (Ethers.js + ERC20)
    // ============================================
    
    const connectBtn = document.getElementById('connect-wallet-btn');
    const buyButtons = document.querySelectorAll('.buy-btn');
    
    // Ethers.js variables
    let provider;
    let signer;
    let userAddress;

    // A. CONNECT WALLET
    async function connectWallet() {
        // Check if MetaMask is installed
        if (!window.ethereum) {
            showToast("MetaMask not found. Please install it.", "error");
            setTimeout(() => window.open('https://metamask.io/download/', '_blank'), 2000);
            return;
        }

        try {
            // 1. Initialize Ethers Provider
            provider = new ethers.BrowserProvider(window.ethereum);
            
            // 2. Request Access
            await provider.send("eth_requestAccounts", []);
            
            // 3. Get Signer (The User)
            signer = await provider.getSigner();
            userAddress = await signer.getAddress();

            // 4. Check Network
            const network = await provider.getNetwork();
            // Convert BigInt chainId to Hex string for comparison
            const chainIdHex = "0x" + network.chainId.toString(16);

            if (chainIdHex !== TARGET_CHAIN_ID) {
                await switchNetwork();
            } else {
                updateUI(userAddress);
                showToast("🚀 Connected! Ready to pay with USDT.", "success");
            }

        } catch (error) {
            console.error("Connection Error:", error);
            showToast("Failed to connect wallet.", "error");
        }
    }

    // B. SWITCH NETWORK
    async function switchNetwork() {
        try {
            showToast("⚠️ Switching to Sepolia Network...", "warning");
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: TARGET_CHAIN_ID }],
            });
            window.location.reload(); // Reload to refresh provider
        } catch (error) {
            // Error 4902 means the chain hasn't been added to MetaMask
            if (error.code === 4902) {
                showToast("❌ Error: Sepolia network not found in MetaMask.", "error");
            } else {
                showToast("❌ Network switch rejected.", "error");
            }
        }
    }

    // C. UPDATE UI
    function updateUI(address) {
        const shortAddress = `${address.substring(0, 6)}...${address.substring(38)}`;
        connectBtn.innerText = shortAddress;
        connectBtn.classList.add('btn-primary');
        connectBtn.classList.remove('btn-sm');
    }

    // D. PAYMENT LOGIC (The Core Feature)
    async function payWithToken(productName, price) {
        if (!signer) {
            showToast("⚠️ Connect wallet first!", "warning");
            connectWallet();
            return;
        }

        try {
            showToast(`Initializing contract for ${productName}...`, "info");

            // 1. Load Token Contract
            const tokenContract = new ethers.Contract(USDT_CONTRACT_ADDRESS, ERC20_ABI, signer);

            // 2. Get Decimals (Crucial for USDT vs ETH)
            // USDT usually has 6 decimals, ETH has 18. We must ask the contract.
            const decimals = await tokenContract.decimals();
            const symbol = await tokenContract.symbol();

            // 3. Calculate Amount (Price * 10^decimals)
            // ethers.parseUnits handles the math safely
            const amountToPay = ethers.parseUnits(price.toString(), decimals);

            // 4. Check User Balance
            const balance = await tokenContract.balanceOf(userAddress);
            if (balance < amountToPay) {
                showToast(`❌ Insufficient ${symbol} balance.`, "error");
                return;
            }

            // 5. Send Transaction (Transfer)
            showToast(`⏳ Confirm transaction in MetaMask...`, "info");
            
            // This calls the 'transfer' function inside the smart contract
            const tx = await tokenContract.transfer(MERCHANT_ADDRESS, amountToPay);

            // 6. Wait for Confirmation (Mining)
            showToast(`Transaction sent! Waiting for block confirmation...`, "info");
            await tx.wait(); // This pauses code until block is mined

            // 7. Success!
            showToast(`✅ Purchase Successful!`, "success");
            console.log("Tx Hash:", tx.hash);
            
            setTimeout(() => {
                window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank');
            }, 1000);

        } catch (error) {
            console.error("Payment Error:", error);
            if (error.code === 'ACTION_REJECTED') {
                showToast("❌ You rejected the transaction.", "error");
            } else {
                showToast("❌ Transaction failed.", "error");
            }
        }
    }

    // ============================================
    // 4. EVENT LISTENERS
    // ============================================

    // Handle Buy Buttons
    buyButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const item = btn.getAttribute('data-item');
            const price = btn.getAttribute('data-price');
            
            // Call the USDT/Token payment function
            payWithToken(item, price); 
        });
    });

    // Detect Wallet Changes
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', () => window.location.reload());
        window.ethereum.on('chainChanged', () => window.location.reload());
    }

    // Connect Button
    connectBtn.addEventListener('click', connectWallet);

});
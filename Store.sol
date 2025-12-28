// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Interface para interagir com USDT (que já existe no blockchain)
interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
}

contract CryptoStore {
    address public owner;
    IERC20 public usdtToken; // Endereço do contrato do USDT

    // Define um produto
    struct Product {
        string name;
        uint256 price; // Preço em USDT (ex: 450000000 para 450.00 USDT)
        uint256 stock;
    }

    mapping(uint256 => Product) public products;
    
    // Evento para o seu Front-End saber que vendeu!
    event ItemPurchased(address buyer, uint256 productId);

    constructor(address _usdtAddress) {
        owner = msg.sender;
        usdtToken = IERC20(_usdtAddress);
        
        // Cadastrando um produto (ID 1, Notebook, $450, 10 un)
        products[1] = Product("Laptop Pro", 450 * 10**6, 10);
    }

    function buyProduct(uint256 _id) external {
        Product storage item = products[_id];
        require(item.stock > 0, "Fora de Estoque");

        // 1. Puxa USDT do cliente para a loja (Requer aprovação prévia)
        require(usdtToken.transferFrom(msg.sender, address(this), item.price), "Pagamento falhou");

        // 2. Atualiza estoque
        item.stock -= 1;

        // 3. Avisa o Front-end
        emit ItemPurchased(msg.sender, _id);
    }
}
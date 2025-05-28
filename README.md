# Pemilu DApps - Decentralized Voting System

A modern, secure, and transparent decentralized voting system built with Web3 technologies. This project implements a blockchain-based voting system that ensures transparency, immutability, and security in the voting process.

## 🚀 Features

- **Decentralized Voting**: Secure and transparent voting process on the blockchain
- **Smart Contract Integration**: Automated vote counting and result verification
- **Modern Frontend**: Built with Next.js and TailwindCSS
- **Secure Backend**: FastAPI-powered backend with robust security measures
- **Web3 Integration**: Seamless wallet connection and transaction handling

## 📸 Application Screenshots

### Landing Page
![Landing Page](./images/Screenshot%202025-05-28%20at%2019.08.19.png)
The landing page provides an overview of the voting system with clear navigation options and information about the election process.

### Wallet Connection
![Wallet Connection](./images/Screenshot%202025-05-28%20at%2019.09.22.png)
Users can connect their Web3 wallet (MetaMask) to interact with the voting system securely.

### Voting Interface
![Voting Interface](./images/Screenshot%202025-05-28%20at%2019.10.40.png)
The main voting interface where users can:
- View candidate information
- Cast their vote
- See real-time voting status

### Transaction Confirmation
![Transaction Confirmation](./images/Screenshot%202025-05-28%20at%2019.10.49.png)
Secure transaction confirmation process through MetaMask to ensure vote integrity.

### Results Dashboard
![Results Dashboard](./images/Screenshot%202025-05-28%20at%2019.11.32.png)
Real-time results dashboard showing:
- Vote distribution
- Candidate statistics
- Total votes cast

### Admin Panel
![Admin Panel](./images/Screenshot%202025-05-28%20at%2019.13.00.png)
Administrative interface for:
- Managing candidates
- Monitoring votes
- System configuration

### Vote Verification
![Vote Verification](./images/Screenshot%202025-05-28%20at%2019.13.43.png)
Vote verification process ensuring:
- Vote authenticity
- Transaction confirmation
- Result accuracy

### Detailed Statistics
![Detailed Statistics](./images/Screenshot%202025-05-28%20at%2019.13.51.png)
Comprehensive statistics view showing:
- Vote distribution
- Time-based analysis
- Regional breakdown

### Transaction History
![Transaction History](./images/Screenshot%202025-05-28%20at%2019.14.06.png)
Complete transaction history for:
- Vote tracking
- Audit purposes
- Transparency

### System Status
![System Status](./images/Screenshot%202025-05-28%20at%2019.14.30.png)
Real-time system status monitoring:
- Network health
- Transaction status
- System performance

## 🏗️ Project Structure

```
pemilu-dapps/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend server
└── contract/          # Solidity smart contracts
```

## 🛠️ Technology Stack

### Frontend
- Next.js 15
- React 19
- TailwindCSS
- RainbowKit for Web3 integration
- Wagmi for Ethereum interactions

### Backend
- FastAPI
- Python 3.x
- Web3.py
- Uvicorn

### Smart Contracts
- Solidity
- Foundry for development and testing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Python 3.x
- Foundry
- MetaMask or any Web3 wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/pemilu-dapps.git
cd pemilu-dapps
```

2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev
```

3. Backend Setup:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r req.txt
uvicorn app.main:app --reload
```

4. Smart Contract Setup:
```bash
cd contract
forge install
forge build
```

## 📝 Usage

1. Connect your Web3 wallet (MetaMask recommended)
2. Navigate to the voting page
3. Select your candidate
4. Confirm the transaction
5. Wait for the transaction to be confirmed
6. View the results in real-time

## 🔒 Security Features

- Smart contract security best practices
- Input validation and sanitization
- Rate limiting
- Secure wallet integration
- Transaction verification

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the maintainers.


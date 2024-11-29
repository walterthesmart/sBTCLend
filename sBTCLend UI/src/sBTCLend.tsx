import React, { useState } from 'react';

const LendingPlatform = () => {
  const [depositAmount, setDepositAmount] = useState('');
  const [borrowAmount, setBorrowAmount] = useState('');
  const [walletConnected, setWalletConnected] = useState(false);

  const handleConnectWallet = () => {
    // Placeholder for wallet connection logic
    setWalletConnected(true);
  };

  const handleDeposit = async () => {
    if (!walletConnected) {
      alert('Please connect wallet first');
      return;
    }
    try {
      // Placeholder for contract interaction
      console.log('Depositing:', depositAmount);
      alert(`Deposited ${depositAmount} sBTC`);
    } catch (error) {
      console.error('Deposit failed', error);
    }
  };

  const handleBorrow = async () => {
    if (!walletConnected) {
      alert('Please connect wallet first');
      return;
    }
    try {
      // Placeholder for contract interaction
      console.log('Borrowing:', borrowAmount);
      alert(`Borrowed ${borrowAmount} sBTC`);
    } catch (error) {
      console.error('Borrow failed', error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Stacks Lending Platform
      </h2>
      
      {!walletConnected ? (
        <div className="mb-4">
          <button 
            onClick={handleConnectWallet}
            className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition duration-300"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-2">Deposit sBTC</label>
            <input 
              type="number" 
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="Enter deposit amount"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleDeposit} 
              className="w-full mt-2 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition duration-300"
            >
              Deposit
            </button>
          </div>
          
          <div>
            <label className="block text-gray-700 mb-2">Borrow sBTC</label>
            <input 
              type="number" 
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              placeholder="Enter borrow amount"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button 
              onClick={handleBorrow}
              className="w-full mt-2 bg-purple-500 text-white py-2 rounded hover:bg-purple-600 transition duration-300"
            >
              Borrow
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LendingPlatform;
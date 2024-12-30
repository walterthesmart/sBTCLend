'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowDownUp, PiggyBank, History } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export default function LendingPlatform() {
  const [depositAmount, setDepositAmount] = useState('')
  const [borrowAmount, setBorrowAmount] = useState('')
  const [walletConnected, setWalletConnected] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleConnectWallet = () => {
    // Placeholder for wallet connection logic
    setWalletConnected(true)
  }

  const handleDeposit = async () => {
    if (!walletConnected) {
      alert('Please connect wallet first')
      return
    }
    try {
      // Placeholder for contract interaction
      console.log('Depositing:', depositAmount)
      alert(`Deposited ${depositAmount} sBTC`)
    } catch (error) {
      console.error('Deposit failed', error)
    }
  }

  const handleBorrow = async () => {
    if (!walletConnected) {
      alert('Please connect wallet first')
      return
    }
    try {
      // Placeholder for contract interaction
      console.log('Borrowing:', borrowAmount)
      alert(`Borrowed ${borrowAmount} sBTC`)
    } catch (error) {
      console.error('Borrow failed', error)
    }
  }

  const renderDashboard = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Total Deposits</CardTitle>
          <CardDescription>Your current deposits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">10.5 sBTC</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Total Borrows</CardTitle>
          <CardDescription>Your current borrows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5.2 sBTC</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Interest Earned</CardTitle>
          <CardDescription>Cumulative interest earned</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.3 sBTC</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Interest Owed</CardTitle>
          <CardDescription>Cumulative interest owed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">0.1 sBTC</div>
        </CardContent>
      </Card>
    </div>
  )

  const renderDepositBorrow = () => (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Deposit sBTC</CardTitle>
          <CardDescription>Earn interest on your deposits</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            type="number" 
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            placeholder="Enter deposit amount"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleDeposit} className="w-full">
            <PiggyBank className="mr-2 h-4 w-4" /> Deposit
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Borrow sBTC</CardTitle>
          <CardDescription>Borrow against your deposits</CardDescription>
        </CardHeader>
        <CardContent>
          <Input 
            type="number" 
            value={borrowAmount}
            onChange={(e) => setBorrowAmount(e.target.value)}
            placeholder="Enter borrow amount"
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleBorrow} variant="secondary" className="w-full">
            <ArrowDownUp className="mr-2 h-4 w-4" /> Borrow
          </Button>
        </CardFooter>
      </Card>
    </div>
  )

  const renderHistory = () => (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>Your recent lending and borrowing activities</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${i % 2 === 0 ? 'bg-green-100' : 'bg-blue-100'}`}>
                  {i % 2 === 0 ? <PiggyBank className="h-4 w-4 text-green-500" /> : <ArrowDownUp className="h-4 w-4 text-blue-500" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{i % 2 === 0 ? 'Deposit' : 'Borrow'}</p>
                  <p className="text-xs text-gray-500">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <p className="text-sm font-medium">{(Math.random() * 10).toFixed(2)} sBTC</p>
            </div>
          ))}
        </ScrollArea>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">Stacks Lending Platform</CardTitle>
          <CardDescription>Deposit, borrow, and earn interest with sBTC</CardDescription>
        </CardHeader>
        <CardContent>
          {!walletConnected ? (
            <Button onClick={handleConnectWallet} className="w-full">
              <Wallet className="mr-2 h-4 w-4" /> Connect Wallet
            </Button>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">Connected</p>
                  <p className="text-xs text-gray-500">0x1234...5678</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setWalletConnected(false)}>Disconnect</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {walletConnected && (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="deposit-borrow">Deposit & Borrow</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>
          <TabsContent value="dashboard" className="space-y-4">
            {renderDashboard()}
          </TabsContent>
          <TabsContent value="deposit-borrow" className="space-y-4">
            {renderDepositBorrow()}
          </TabsContent>
          <TabsContent value="history" className="space-y-4">
            {renderHistory()}
          </TabsContent>
        </Tabs>
      )}

      {!walletConnected && (
        <Alert>
          <AlertTitle>Welcome to Stacks Lending Platform</AlertTitle>
          <AlertDescription>
            Connect your wallet to start depositing and borrowing sBTC. Earn interest on your deposits and borrow against your collateral.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}


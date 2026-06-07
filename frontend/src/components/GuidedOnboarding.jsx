import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Target, 
  PlusCircle, 
  CheckCircle,
  PiggyBank
} from 'lucide-react';
import { incomeApi, budgetApi, expenseApi } from '../api/client';
import './GuidedOnboarding.css';

export default function GuidedOnboarding({ onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Income State
  const [incomeSource, setIncomeSource] = useState('Primary Salary');
  const [incomeAmount, setIncomeAmount] = useState('');

  // Step 2: Budget State
  const [budgetLimit, setBudgetLimit] = useState('50000');

  // Step 3: Expense State
  const [expenseDescription, setExpenseDescription] = useState('Groceries');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Food');

  const handleNextStep = async () => {
    setError('');
    
    if (step === 1) {
      if (!incomeAmount || parseFloat(incomeAmount) <= 0) {
        setError('Please enter a valid income amount.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!budgetLimit || parseFloat(budgetLimit) <= 0) {
        setError('Please enter a valid monthly budget limit.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!expenseAmount || parseFloat(expenseAmount) <= 0) {
        setError('Please enter a starting transaction amount.');
        return;
      }

      setLoading(true);
      try {
        const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7); // YYYY-MM
        const todayStr = new Date().toISOString().split('T')[0];

        // 1. Save Income
        await incomeApi.create({
          source: incomeSource,
          amount: parseFloat(incomeAmount),
          date: todayStr
        });

        // 2. Save Budget
        await budgetApi.setBudget({
          month: currentMonth,
          monthlyLimit: parseFloat(budgetLimit)
        });

        // 3. Save starting Expense
        await expenseApi.create({
          category: expenseCategory,
          amount: parseFloat(expenseAmount),
          description: expenseDescription,
          date: todayStr
        });

        setStep(4);
      } catch (err) {
        setError('Failed to persist onboarding parameters: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="onboarding-overlay flex items-center justify-center">
      <div className="onboarding-card glass-panel fade-in text-center">
        {error && <div className="onboarding-error mb-4">{error}</div>}

        {step === 1 && (
          <div className="onboarding-step">
            <div className="step-icon-circle accent mx-auto">
              <DollarSign size={28} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Welcome to CentricAI!</h3>
            <p className="text-sm text-muted mt-2">
              Let's build your financial canvas. To start, log your primary monthly income stream.
            </p>

            <div className="form-group text-left mt-6">
              <label className="form-label">Income Source Name</label>
              <input 
                type="text" 
                className="form-input" 
                value={incomeSource} 
                onChange={(e) => setIncomeSource(e.target.value)} 
                placeholder="e.g. Salary, Consulting, Passive" 
              />
            </div>

            <div className="form-group text-left mt-3">
              <label className="form-label">Monthly Value (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={incomeAmount} 
                onChange={(e) => setIncomeAmount(e.target.value)} 
                placeholder="e.g. 75000" 
                required
              />
            </div>

            <button onClick={handleNextStep} className="btn btn-primary w-full mt-6">
              <span>Continue Allocation Setup</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step">
            <div className="step-icon-circle warning mx-auto">
              <Target size={28} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Define Budget Directive</h3>
            <p className="text-sm text-muted mt-2">
              Next, set up your monthly safety budget limit cap. Our AI warning system monitors this to block overruns.
            </p>

            <div className="form-group text-left mt-6">
              <label className="form-label">Monthly Maximum Cap (₹)</label>
              <input 
                type="number" 
                className="form-input text-lg font-bold" 
                value={budgetLimit} 
                onChange={(e) => setBudgetLimit(e.target.value)} 
                placeholder="e.g. 50000" 
                required
              />
            </div>

            <button onClick={handleNextStep} className="btn btn-primary w-full mt-6">
              <span>Enforce Budget Cap</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step">
            <div className="step-icon-circle primary mx-auto">
              <PlusCircle size={28} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Log First Transaction</h3>
            <p className="text-sm text-muted mt-2">
              Excellent! Let's insert a starting expense item to kickstart the AI insights engines.
            </p>

            <div className="form-group text-left mt-6">
              <label className="form-label">Classification Tag</label>
              <select 
                className="form-select" 
                value={expenseCategory} 
                onChange={(e) => setExpenseCategory(e.target.value)}
              >
                <option value="Food">Food</option>
                <option value="Transport">Transport</option>
                <option value="Shopping">Shopping</option>
                <option value="Bills">Bills</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>

            <div className="form-group text-left mt-3">
              <label className="form-label">Description Note</label>
              <input 
                type="text" 
                className="form-input" 
                value={expenseDescription} 
                onChange={(e) => setExpenseDescription(e.target.value)} 
                placeholder="e.g. Weekly organic vegetables" 
              />
            </div>

            <div className="form-group text-left mt-3">
              <label className="form-label">Transaction Value (₹)</label>
              <input 
                type="number" 
                className="form-input" 
                value={expenseAmount} 
                onChange={(e) => setExpenseAmount(e.target.value)} 
                placeholder="e.g. 1500" 
                required
              />
            </div>

            <button 
              onClick={handleNextStep} 
              disabled={loading} 
              className="btn btn-primary w-full mt-6"
            >
              <span>{loading ? 'Routing parameters...' : 'Complete Guided Setup'}</span>
              {!loading && <ArrowRight size={16} />}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="onboarding-step">
            <div className="step-icon-circle success mx-auto animate-bounce">
              <CheckCircle size={28} />
            </div>
            <h3 className="mt-4 text-xl font-bold">Intelligence Setup Completed!</h3>
            <p className="text-sm text-muted mt-2">
              All financial vectors, budget thresholds, and ledger items are successfully synchronized with the platform databases.
            </p>

            <button onClick={onComplete} className="btn btn-primary w-full mt-8">
              <span>Launch Command Central Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

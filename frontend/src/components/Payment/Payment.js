import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "../Button/Button.js";
import { Card, CardHeader, CardTitle, CardContent } from "../Card/Card.js";
import Layout from "../Layout/Layout";
import { useNavigate } from 'react-router-dom';


const stripePromise = loadStripe('pk_test_51QOEgjH9ehGELQwr5bqknMyvxdBhaIyYU5FIoGyg19DA7Jg8dIld6JZsUkp7W9nMETZUBTAWPP2F0jsXoWd9yLYC00ESvyw1zc');

const PaymentForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [cardType, setCardType] = useState('');
  const navigate = useNavigate();


  // Function to fetch the client secret from the backend
  const fetchPaymentIntent = async (amount) => {
    try {
      const response = await fetch('http://localhost:4000/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: amount * 100 }), // Convert amount to cents
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const { clientSecret } = await response.json();

      if (!clientSecret) {
        throw new Error('Failed to retrieve client secret.');
      }

      return clientSecret; // Return the client secret for further use
    } catch (error) {
      console.error('Error fetching client secret:', error.message);
      throw error;
    }
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      setError('Stripe is not loaded.');
      setProcessing(false);
      return;
    }

    try {
      // Fetch the client secret using the reusable function
      const clientSecret = await fetchPaymentIntent(amount);

      // Confirm the payment on the frontend
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: {
            name: 'Test User', // Replace with dynamic user data if available
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setProcessing(false);
      } else if (result.paymentIntent.status === 'succeeded') {
        setSucceeded(true);
        setError(null);
        setProcessing(false);
        setTimeout(() => {
            navigate('/patient/dashboard'); // Redirect to the Patient Calendar page
          }, 5000); 
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
      setProcessing(false);
    }
  };

  // Success message
  if (succeeded) {
    return (
      <div className="text-center text-green-600">
        <h2 className="text-2xl font-bold mb-4">Payment Successful!</h2>
        <p>Thank you for your payment. Your transaction has been processed.</p>
      </div>
    );
  }

  // Payment form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-100 p-4 rounded-md">
        <h3 className="font-bold mb-2">Amount to Pay</h3>
        <p className="text-2xl font-bold text-green-600">${amount.toFixed(2)}</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Card Type</label>
          <select
            className="w-full p-2 border rounded"
            value={cardType}
            onChange={(e) => setCardType(e.target.value)}
            required
          >
            <option value="">Select card type</option>
            <option value="credit">Credit Card</option>
            <option value="debit">Debit Card</option>
          </select>
        </div>
        
        <div>
          <label className="block mb-2">Card Number</label>
          <CardNumberElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
            className="p-2 border rounded"
          />
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block mb-2">Expiration Date</label>
            <CardExpiryElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              className="p-2 border rounded"
            />
          </div>
          <div className="flex-1">
            <label className="block mb-2">CVV</label>
            <CardCvcElement 
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#9e2146',
                  },
                },
              }}
              className="p-2 border rounded"
            />
          </div>
        </div>
      </div>
      
      {error && <div className="text-red-500 mt-2">{error}</div>}
      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className={`w-full p-2 rounded mt-4 ${
          processing || !stripe 
            ? 'bg-gray-300 cursor-not-allowed' 
            : 'bg-red-700 text-white hover:bg-red-800'
        }`}
      >
        {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

const PaymentPage = () => {
  const amount = 50.00; // Example amount, you can pass this as a prop or fetch from state

  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">
          Payment for Appointment
        </h1>
        <Card className="mb-8 max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements stripe={stripePromise}>
              <PaymentForm amount={amount} />
            </Elements>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default PaymentPage;

import React from 'react';
import Layout from '../Layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../Card/Card';
import { Button } from "../Button/Button.js";

const Claims = () => {
  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Track Your Claim</h1>
        <Card className="mb-8 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Claim Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Claim ID</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter the Claim ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Policy Number</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter Policy Number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Beneficiary DOB</label>
                <input
                  type="date"
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Employee ID</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter Employee ID"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-red-700 text-white p-2 rounded-md hover:bg-red-800"
              >
                Track My Claim
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Claims;

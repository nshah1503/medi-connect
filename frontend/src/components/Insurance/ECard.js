import React from 'react';
import Layout from '../Layout/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '../Card/Card';
import { Button } from "../Button/Button.js";

const ECard = () => {
  return (
    <Layout userType="patient">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-red-700">Download E-Card</h1>
        <Card className="mb-8 max-w-lg mx-auto">
          <CardHeader>
            <CardTitle className="text-xl font-bold">E-Card Details</CardTitle>
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
                <label className="block text-sm font-medium mb-2">Beneficiary Name</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter Beneficiary's Name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Date of Admission</label>
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
              <p className="text-sm text-gray-600">
                * Provide at least one of Employee ID or Beneficiary Name.
              </p>
              <Button
                type="submit"
                className="w-full bg-red-700 text-white p-2 rounded-md hover:bg-red-800"
              >
                Submit to download E-Card
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ECard;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { submitSpeedRecord, createComplaint } from '@/services/api';
import { Wifi, Download, Upload, Timer, AlertCircle } from 'lucide-react';

interface SpeedTestResult {
  downloadMbps: number;
  uploadMbps: number;
  pingMs: number;
}

const StandaloneSpeedTest = () => {
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResult, setTestResult] = useState<SpeedTestResult | null>(null);
  const [email, setEmail] = useState('');
  
  // Complaint form fields
  const [complaintEmail, setComplaintEmail] = useState('');
  const [apartmentNo, setApartmentNo] = useState('');
  const [complaintDescription, setComplaintDescription] = useState('');
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();

  const runSpeedTest = () => {
    setIsRunningTest(true);
    
    // Simulate speed test with realistic values
    setTimeout(() => {
      const mockResult: SpeedTestResult = {
        downloadMbps: Math.round((Math.random() * 100 + 20) * 10) / 10,
        uploadMbps: Math.round((Math.random() * 50 + 10) * 10) / 10,
        pingMs: Math.round(Math.random() * 30 + 5)
      };
      
      setTestResult(mockResult);
      setIsRunningTest(false);
    }, 3000);
  };

  // Auto-save speed test result when test completes
  useEffect(() => {
    const autoSaveResult = async () => {
      if (!testResult || !email) {
        toast({
          variant: "destructive",
          title: "Missing Email",
          description: "Please provide your email to save test results."
        });
        return;
      }

      try {
        await submitSpeedRecord({
          email,
          downloadMbps: testResult.downloadMbps,
          uploadMbps: testResult.uploadMbps,
          pingMs: testResult.pingMs
        });

        toast({
          title: "Speed Test Saved",
          description: "Your speed test results have been automatically saved!"
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Save Failed",
          description: "Failed to save speed test data automatically."
        });
      }
    };

    if (testResult && email) {
      autoSaveResult();
    }
  }, [testResult, email, toast]);

  const submitComplaint = async () => {
    if (!complaintEmail || !apartmentNo || !complaintDescription) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all fields."
      });
      return;
    }

    setIsSubmittingComplaint(true);
    
    try {
      await createComplaint({
        email: complaintEmail,
        appartmentNo: apartmentNo,
        description: complaintDescription
      });

      toast({
        title: "Complaint Submitted",
        description: "Your complaint has been submitted successfully!"
      });
      
      setComplaintEmail('');
      setApartmentNo('');
      setComplaintDescription('');
      setDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit complaint. Please try again."
      });
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-xl text-foreground">Internet Speed Test</h1>
              <p className="text-sm text-muted-foreground">Test your connection speed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6 max-w-4xl">
        {/* Email Input Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Email</CardTitle>
            <CardDescription>Provide your email to automatically save test results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="max-w-md"
              />
            </div>
          </CardContent>
        </Card>

        {/* Speed Test Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              Speed Test
            </CardTitle>
            <CardDescription>Click the button below to test your internet speed. Results will be saved automatically.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button 
                onClick={runSpeedTest} 
                disabled={isRunningTest || !email}
                size="lg"
                className="min-w-[200px]"
              >
                {isRunningTest ? 'Testing...' : 'Start Speed Test'}
              </Button>
              {!email && (
                <p className="text-sm text-muted-foreground mt-2">Please enter your email first</p>
              )}
            </div>

            {isRunningTest && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
                <p className="text-muted-foreground">Running speed test, please wait...</p>
              </div>
            )}

            {testResult && !isRunningTest && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-6 border rounded-lg bg-card">
                  <Download className="h-10 w-10 mx-auto mb-3 text-green-500" />
                  <div className="text-3xl font-bold">{testResult.downloadMbps}</div>
                  <div className="text-sm text-muted-foreground">Mbps Download</div>
                </div>
                <div className="text-center p-6 border rounded-lg bg-card">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-blue-500" />
                  <div className="text-3xl font-bold">{testResult.uploadMbps}</div>
                  <div className="text-sm text-muted-foreground">Mbps Upload</div>
                </div>
                <div className="text-center p-6 border rounded-lg bg-card">
                  <Timer className="h-10 w-10 mx-auto mb-3 text-orange-500" />
                  <div className="text-3xl font-bold">{testResult.pingMs}</div>
                  <div className="text-sm text-muted-foreground">ms Ping</div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Report Issue Section */}
        <div className="text-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive" size="lg" className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Report Internet Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Report an Internet Issue</DialogTitle>
                <DialogDescription>
                  Describe the internet connectivity issue you're experiencing
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="complaint-email">Email Address</Label>
                  <Input
                    id="complaint-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={complaintEmail}
                    onChange={(e) => setComplaintEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-apartment">Apartment Number</Label>
                  <Input
                    id="complaint-apartment"
                    placeholder="B1-102"
                    value={apartmentNo}
                    onChange={(e) => setApartmentNo(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="complaint-description">Issue Description</Label>
                  <Textarea
                    id="complaint-description"
                    placeholder="WiFi speed is too slow during the evening hours..."
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button 
                  onClick={submitComplaint} 
                  disabled={isSubmittingComplaint}
                  className="w-full"
                >
                  {isSubmittingComplaint ? 'Submitting...' : 'Submit Complaint'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default StandaloneSpeedTest;
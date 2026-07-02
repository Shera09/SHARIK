'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  BarChart3,
  Target,
  Activity,
  Sparkles,
  Brain,
  RefreshCcw,
  Download,
  Eye,
  Settings,
  Play,
  Pause,
  Zap,
} from 'lucide-react';
import {
  LineChart as RLineChart, Line, AreaChart, Area, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend, Bar, BarChart
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';

interface PredictiveModel {
  model_id: string;
  name: string;
  code: string;
  model_type: string;
  target_metric: string;
  model_status: string;
  accuracy: number;
  last_trained: string | null;
}

export default function ForecastsPage() {
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<string>('revenue');
  const [timeRange, setTimeRange] = useState('90d');

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      const { data, error } = await supabase
        .from('predictive_models')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setModels(data || []);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  }

  // Mock forecast data
  const revenueForecast = [
    { date: 'Jul 01', actual: 5600000, predicted: null, lower: null, upper: null },
    { date: 'Jul 05', actual: 5420000, predicted: null, lower: null, upper: null },
    { date: 'Jul 10', actual: 5890000, predicted: null, lower: null, upper: null },
    { date: 'Jul 15', actual: 6100000, predicted: null, lower: null, upper: null },
    { date: 'Jul 20', actual: 5780000, predicted: null, lower: null, upper: null },
    { date: 'Jul 25', actual: 6250000, predicted: null, lower: null, upper: null },
    { date: 'Jul 30', actual: null, predicted: 6420000, lower: 5980000, upper: 6860000 },
    { date: 'Aug 05', actual: null, predicted: 6580000, lower: 6050000, upper: 7110000 },
    { date: 'Aug 10', actual: null, predicted: 6820000, lower: 6150000, upper: 7490000 },
    { date: 'Aug 15', actual: null, predicted: 7050000, lower: 6280000, upper: 7820000 },
    { date: 'Aug 20', actual: null, predicted: 7380000, lower: 6420000, upper: 8340000 },
    { date: 'Aug 25', actual: null, predicted: 7620000, lower: 6550000, upper: 8690000 },
    { date: 'Aug 30', actual: null, predicted: 7850000, lower: 6680000, upper: 9020000 },
  ];

  const customerForecast = [
    { date: 'Week 1', actual: 2580, predicted: null },
    { date: 'Week 2', actual: 2620, predicted: null },
    { date: 'Week 3', actual: 2690, predicted: null },
    { date: 'Week 4', actual: 2750, predicted: null },
    { date: 'Week 5', actual: null, predicted: 2820 },
    { date: 'Week 6', actual: null, predicted: 2890 },
    { date: 'Week 7', actual: null, predicted: 2970 },
    { date: 'Week 8', actual: null, predicted: 3050 },
  ];

  const modelPerformance = [
    { model: 'Revenue', accuracy: 94.2, precision: 92.8, recall: 95.1, status: 'active' },
    { model: 'Customer Churn', accuracy: 87.5, precision: 85.2, recall: 89.8, status: 'active' },
    { model: 'Lead Conversion', accuracy: 82.1, precision: 79.5, recall: 84.6, status: 'active' },
    { model: 'Support Volume', accuracy: 91.3, precision: 88.9, recall: 93.2, status: 'active' },
  ];

  const scenarios = [
    { scenario: 'Base Case', growth: '+12%', revenue: '₹85.2M', probability: 65 },
    { scenario: 'Optimistic', growth: '+18%', revenue: '₹89.8M', probability: 20 },
    { scenario: 'Pessimistic', growth: '+6%', revenue: '₹80.5M', probability: 15 },
  ];

  const modelStats = models.length > 0 ? models : [
    { model_id: '1', name: 'Revenue Forecast', code: 'REVENUE_FC', model_type: 'Time Series', target_metric: 'Revenue', model_status: 'active', accuracy: 94.2, last_trained: new Date().toISOString() },
    { model_id: '2', name: 'Customer Churn', code: 'CHURN_FC', model_type: 'Classification', target_metric: 'Churn Probability', model_status: 'active', accuracy: 87.5, last_trained: new Date().toISOString() },
    { model_id: '3', name: 'Lead Scoring', code: 'LEAD_FC', model_type: 'Regression', target_metric: 'Conversion Probability', model_status: 'training', accuracy: 82.1, last_trained: null },
  ];

  return (
    <AppShell>
      <PageHeader
        title="Predictive Analytics"
        description="AI-powered forecasting and predictive modeling"
        action={
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[140px]">
                <Calendar className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30d">30 Days</SelectItem>
                <SelectItem value="90d">90 Days</SelectItem>
                <SelectItem value="180d">6 Months</SelectItem>
                <SelectItem value="365d">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5">
              <RefreshCcw className="h-4 w-4" />
              Retrain
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
      />

      {/* Model Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Active Models', value: modelStats.filter(m => m.model_status === 'active').length, icon: Brain, color: 'text-purple-600' },
          { label: 'Avg Accuracy', value: '89.3%', icon: Target, color: 'text-green-600' },
          { label: 'Forecasts Today', value: '1,247', icon: LineChart, color: 'text-blue-600' },
          { label: 'Data Points', value: '2.4M', icon: Activity, color: 'text-orange-600' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={cn("mt-1 text-2xl font-bold", stat.color)}>{stat.value}</p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="forecasts" className="mt-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="scenarios">Scenarios</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="forecasts" className="mt-6">
          {/* Forecast Selector */}
          <div className="flex items-center gap-4 mb-6">
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select forecast" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="revenue">Revenue Forecast</SelectItem>
                <SelectItem value="customers">Customer Growth</SelectItem>
                <SelectItem value="churn">Churn Prediction</SelectItem>
                <SelectItem value="leads">Lead Conversion</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline" className="gap-1.5 bg-purple-500/10 text-purple-700 border-purple-500/20">
              <Sparkles className="h-3 w-3" />
              94.2% Accuracy
            </Badge>
          </div>

          {/* Revenue Forecast Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Revenue Forecast
              </CardTitle>
              <CardDescription>Historical data and 90-day predictions with confidence intervals</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={revenueForecast}>
                  <defs>
                    <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" tickFormatter={(v) => `₹${v/100000}L`} />
                  <RechartsTooltip formatter={(value: any) => `₹${(value/100000).toFixed(1)}L`} />
                  <Legend />
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#colorConfidence)" name="Confidence Upper" />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="url(#colorConfidence)" name="Confidence Lower" />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', strokeWidth: 2 }} name="Actual" />
                  <Line type="monotone" dataKey="predicted" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: '#3b82f6', strokeWidth: 2 }} name="Predicted" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Forecast Summary */}
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Predicted Next Month</p>
                <p className="mt-2 text-3xl font-bold text-blue-600">₹76.5L</p>
                <div className="mt-2 flex items-center gap-1.5 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600">+18.2%</span>
                  <span className="text-muted-foreground">vs current</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Confidence Level</p>
                <p className="mt-2 text-3xl font-bold">92.4%</p>
                <Progress value={92.4} className="mt-3 h-2" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm text-muted-foreground">Prediction Range</p>
                <p className="mt-2 text-lg font-bold">₹66.8L - ₹90.2L</p>
                <p className="text-sm text-muted-foreground mt-1">95% confidence interval</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="models" className="mt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modelStats.map((model, i) => (
              <motion.div
                key={model.model_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{model.name}</CardTitle>
                        <CardDescription>{model.model_type}</CardDescription>
                      </div>
                      <Badge className={cn(
                        model.model_status === 'active' && "bg-green-500/10 text-green-700",
                        model.model_status === 'training' && "bg-yellow-500/10 text-yellow-700",
                        model.model_status === 'deprecated' && "bg-gray-500/10 text-gray-700"
                      )}>
                        {model.model_status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Target Metric</p>
                        <p className="font-medium">{model.target_metric}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Accuracy</p>
                        <div className="flex items-center gap-2">
                          <Progress value={model.accuracy} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{model.accuracy}%</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                          <Eye className="h-4 w-4" />
                          Details
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Scenario Analysis
                </CardTitle>
                <CardDescription>Revenue projections under different conditions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scenarios.map((scenario) => (
                    <div key={scenario.scenario} className="p-4 rounded-lg border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{scenario.scenario}</p>
                          <p className="text-sm text-muted-foreground">Growth: {scenario.growth}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{scenario.revenue}</p>
                          <Badge variant="outline">{scenario.probability}% probability</Badge>
                        </div>
                      </div>
                      <Progress value={scenario.probability} className="mt-3 h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Performance</CardTitle>
                <CardDescription>Accuracy metrics for active models</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={modelPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="model" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" domain={[70, 100]} />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="accuracy" fill="#3b82f6" name="Accuracy %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="precision" fill="#10b981" name="Precision %" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="recall" fill="#f59e0b" name="Recall %" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Performance Dashboard</CardTitle>
              <CardDescription>Track accuracy, precision, and recall across all models</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RLineChart data={modelPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="model" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" domain={[70, 100]} />
                  <RechartsTooltip />
                  <Legend />
                  <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={2} name="Accuracy" />
                  <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2} name="Precision" />
                  <Line type="monotone" dataKey="recall" stroke="#f59e0b" strokeWidth={2} name="Recall" />
                </RLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

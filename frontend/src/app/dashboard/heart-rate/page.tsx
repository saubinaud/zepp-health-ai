'use client';

import { useEffect, useState } from 'react';
import { dataAPI } from '@/lib/api';
import { HRChart } from '@/components/charts/HRChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Activity, TrendingUp, TrendingDown } from 'lucide-react';

export default function HeartRatePage() {
  const [hrData, setHRData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, max: 0, min: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dataAPI.getHeartRate({ interval: 5 });
        setHRData(response.data);

        if (response.data.length > 0) {
          const hrs = response.data.map((d: any) => d.heart_rate);
          setStats({
            avg: Math.round(hrs.reduce((a: number, b: number) => a + b, 0) / hrs.length),
            max: Math.max(...hrs),
            min: Math.min(...hrs),
          });
        }
      } catch (error) {
        console.error('Error fetching HR data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Frecuencia Cardíaca</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Análisis detallado de tu ritmo cardíaco</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Promedio</CardTitle>
            <Activity className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avg} bpm</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Máxima</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.max} bpm</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mínima</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.min} bpm</div>
          </CardContent>
        </Card>
      </div>

      {hrData.length > 0 && (
        <HRChart data={hrData} title="Frecuencia Cardíaca Detallada" description="Últimos 7 días (muestreo cada 5 minutos)" />
      )}
    </div>
  );
}

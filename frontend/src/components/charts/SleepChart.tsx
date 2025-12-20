'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface SleepChartProps {
  data: Array<{
    date: string;
    deep_sleep?: number;
    light_sleep?: number;
    rem_sleep?: number;
    awake_time?: number;
  }>;
}

export function SleepChart({ data }: SleepChartProps) {
  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
    }),
    'Sueño Profundo': Math.round((item.deep_sleep || 0) / 60),
    'Sueño Ligero': Math.round((item.light_sleep || 0) / 60),
    'Sueño REM': Math.round((item.rem_sleep || 0) / 60),
    'Despierto': Math.round((item.awake_time || 0) / 60),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fases de Sueño</CardTitle>
        <CardDescription>Últimos 7 días (horas)</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-muted-foreground"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
            />
            <Legend />
            <Bar dataKey="Sueño Profundo" stackId="a" fill="#3b82f6" />
            <Bar dataKey="Sueño Ligero" stackId="a" fill="#60a5fa" />
            <Bar dataKey="Sueño REM" stackId="a" fill="#93c5fd" />
            <Bar dataKey="Despierto" stackId="a" fill="#f87171" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

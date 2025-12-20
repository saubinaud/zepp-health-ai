'use client';

import { useEffect, useState } from 'react';
import { dataAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Clock, Zap, Heart } from 'lucide-react';
import { formatDuration } from '@/lib/utils';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dataAPI.getWorkouts({ limit: 20 });
        setWorkouts(response.data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const totalWorkouts = workouts.length;
  const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalCalories = workouts.reduce((sum, w) => sum + (w.calories || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrenamientos</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Historial de tus actividades físicas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entrenamientos</CardTitle>
            <Dumbbell className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Total</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(Math.round(totalDuration / 60))}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calorías Quemadas</CardTitle>
            <Zap className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalories} kcal</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Entrenamientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workouts.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No hay entrenamientos registrados
              </div>
            ) : (
              workouts.map((workout, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <Dumbbell className="text-orange-600" size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 dark:text-white capitalize">{workout.type || 'Ejercicio'}</p>
                        <Badge variant="secondary">{formatDuration(Math.round(workout.duration / 60))}</Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(workout.start_time).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {workout.calories && (
                      <p className="font-medium text-gray-900 dark:text-white">{workout.calories} kcal</p>
                    )}
                    {workout.distance && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {(workout.distance / 1000).toFixed(2)} km
                      </p>
                    )}
                    {workout.avg_heart_rate && (
                      <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center justify-end gap-1">
                        <Heart size={12} /> {workout.avg_heart_rate} bpm
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

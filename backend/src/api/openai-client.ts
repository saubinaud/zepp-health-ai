import OpenAI from 'openai';
import { HealthContext, AIAnalysisResponse } from '../types';

export class OpenAIClient {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
  }

  /**
   * Analyze health data and provide insights
   */
  async analyzeHealthData(
    context: HealthContext,
    analysisType: 'daily' | 'weekly' | 'monthly' | 'custom' | 'chat',
    customQuestion?: string
  ): Promise<AIAnalysisResponse & { tokensUsed: number }> {
    try {
      const systemPrompt = this.buildSystemPrompt();
      const userPrompt = this.buildUserPrompt(context, analysisType, customQuestion);

      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000'),
      });

      const response = completion.choices[0].message.content;
      const tokensUsed = completion.usage?.total_tokens || 0;

      // Parse the AI response
      const parsedResponse = this.parseAIResponse(response || '');

      return {
        ...parsedResponse,
        tokensUsed,
      };
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`AI analysis failed: ${error.message}`);
    }
  }

  /**
   * Build system prompt for the AI
   */
  private buildSystemPrompt(): string {
    return `You are an advanced health data analyst AI assistant specializing in wearable device data interpretation.
Your role is to analyze health metrics from a Zepp/Huami smart ring and provide comprehensive, actionable insights.

Your analysis should include:
1. **Summary**: Brief overview of the health data trends
2. **Insights**: Detailed observations about patterns, correlations, and anomalies
3. **Recommendations**: Specific, actionable advice for improving health metrics
4. **Alerts**: Any concerning patterns that require attention (if applicable)

Guidelines:
- Be precise and data-driven in your analysis
- Identify correlations between different metrics (e.g., sleep quality vs. stress, exercise vs. heart rate)
- Provide context-aware recommendations based on the user's historical data
- Flag any abnormal values or concerning trends
- Use medical terminology when appropriate but explain it clearly
- Consider the holistic picture of the user's health
- Assign a confidence score (0-100) to your analysis based on data quality and completeness

Response Format (use this exact structure):
SUMMARY:
[Your summary here]

INSIGHTS:
- [Insight 1]
- [Insight 2]
- [Insight 3]

RECOMMENDATIONS:
- [Recommendation 1]
- [Recommendation 2]
- [Recommendation 3]

ALERTS:
- [Alert 1 if any]
- [Alert 2 if any]

CONFIDENCE: [0-100]`;
  }

  /**
   * Build user prompt with health data context
   */
  private buildUserPrompt(
    context: HealthContext,
    analysisType: string,
    customQuestion?: string
  ): string {
    let prompt = '';

    // Add date range
    prompt += `Analyzing health data from ${context.date_range.from} to ${context.date_range.to}\n\n`;

    // Add demographics if available
    if (context.user_demographics) {
      prompt += 'USER DEMOGRAPHICS:\n';
      if (context.user_demographics.age) prompt += `Age: ${context.user_demographics.age}\n`;
      if (context.user_demographics.gender) prompt += `Gender: ${context.user_demographics.gender}\n`;
      if (context.user_demographics.height) prompt += `Height: ${context.user_demographics.height}cm\n`;
      if (context.user_demographics.weight) prompt += `Weight: ${context.user_demographics.weight}kg\n`;
      prompt += '\n';
    }

    // Add daily summaries
    if (context.daily_summaries.length > 0) {
      prompt += 'DAILY SUMMARIES:\n';
      context.daily_summaries.forEach((day) => {
        prompt += `Date: ${day.date}\n`;
        prompt += `  Steps: ${day.steps}, Calories: ${day.calories}, Distance: ${day.distance}m\n`;
        if (day.sleep_duration) {
          prompt += `  Sleep: ${day.sleep_duration}min (Deep: ${day.deep_sleep}min, Light: ${day.light_sleep}min, REM: ${day.rem_sleep}min)\n`;
        }
        if (day.heart_rate_avg) {
          prompt += `  HR: Avg ${day.heart_rate_avg} bpm (Max: ${day.heart_rate_max}, Min: ${day.heart_rate_min})\n`;
        }
        if (day.hrv_avg) {
          prompt += `  HRV: ${day.hrv_avg}ms\n`;
        }
        prompt += '\n';
      });
    }

    // Add stress data summary
    if (context.stress_data.length > 0) {
      const avgStress = context.stress_data.reduce((sum, r) => sum + r.stress_level, 0) / context.stress_data.length;
      const maxStress = Math.max(...context.stress_data.map(r => r.stress_level));
      prompt += `STRESS DATA: ${context.stress_data.length} readings, Avg: ${avgStress.toFixed(1)}, Max: ${maxStress}\n\n`;
    }

    // Add SpO2 data summary
    if (context.spo2_data.length > 0) {
      const avgSpO2 = context.spo2_data.reduce((sum, r) => sum + r.spo2_value, 0) / context.spo2_data.length;
      const minSpO2 = Math.min(...context.spo2_data.map(r => r.spo2_value));
      prompt += `SPO2 DATA: ${context.spo2_data.length} readings, Avg: ${avgSpO2.toFixed(1)}%, Min: ${minSpO2}%\n\n`;
    }

    // Add PAI scores
    if (context.pai_scores.length > 0) {
      prompt += 'PAI SCORES:\n';
      context.pai_scores.forEach((score) => {
        prompt += `  ${score.date}: ${score.pai_score}\n`;
      });
      prompt += '\n';
    }

    // Add workouts
    if (context.workouts.length > 0) {
      prompt += `WORKOUTS: ${context.workouts.length} sessions\n`;
      context.workouts.forEach((workout) => {
        prompt += `  ${workout.type} - ${workout.duration}s`;
        if (workout.distance) prompt += `, ${workout.distance}m`;
        if (workout.avg_heart_rate) prompt += `, Avg HR: ${workout.avg_heart_rate} bpm`;
        prompt += '\n';
      });
      prompt += '\n';
    }

    // Add specific question based on analysis type
    if (analysisType === 'chat' && customQuestion) {
      prompt += `USER QUESTION: ${customQuestion}\n\n`;
      prompt += 'Please answer the user\'s question based on the health data provided above.';
    } else {
      switch (analysisType) {
        case 'daily':
          prompt += 'Provide a comprehensive daily health analysis focusing on today\'s metrics and how they compare to recent trends.';
          break;
        case 'weekly':
          prompt += 'Provide a weekly health analysis identifying patterns, improvements, and areas of concern over the past 7 days.';
          break;
        case 'monthly':
          prompt += 'Provide a monthly health analysis with long-term trends, significant changes, and overall health trajectory.';
          break;
        default:
          prompt += 'Provide a comprehensive health analysis of the provided data.';
      }
    }

    return prompt;
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(response: string): AIAnalysisResponse {
    const sections = {
      summary: '',
      insights: [] as string[],
      recommendations: [] as string[],
      alerts: [] as string[],
      confidence_score: 75, // default
    };

    try {
      // Extract summary
      const summaryMatch = response.match(/SUMMARY:\s*([\s\S]*?)(?=\n\s*INSIGHTS:|$)/i);
      if (summaryMatch) {
        sections.summary = summaryMatch[1].trim();
      }

      // Extract insights
      const insightsMatch = response.match(/INSIGHTS:\s*([\s\S]*?)(?=\n\s*RECOMMENDATIONS:|$)/i);
      if (insightsMatch) {
        sections.insights = insightsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(line => line.length > 0);
      }

      // Extract recommendations
      const recommendationsMatch = response.match(/RECOMMENDATIONS:\s*([\s\S]*?)(?=\n\s*ALERTS:|$)/i);
      if (recommendationsMatch) {
        sections.recommendations = recommendationsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(line => line.length > 0);
      }

      // Extract alerts
      const alertsMatch = response.match(/ALERTS:\s*([\s\S]*?)(?=\n\s*CONFIDENCE:|$)/i);
      if (alertsMatch) {
        sections.alerts = alertsMatch[1]
          .split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^-\s*/, '').trim())
          .filter(line => line.length > 0);
      }

      // Extract confidence score
      const confidenceMatch = response.match(/CONFIDENCE:\s*(\d+)/i);
      if (confidenceMatch) {
        sections.confidence_score = parseInt(confidenceMatch[1]);
      }

      // Fallback if parsing failed
      if (!sections.summary && !sections.insights.length) {
        sections.summary = response;
      }
    } catch (error) {
      console.error('Error parsing AI response:', error);
      sections.summary = response;
    }

    return sections;
  }
}

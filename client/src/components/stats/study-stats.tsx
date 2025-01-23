import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceStrict } from "date-fns";
import type { StudySession } from "@db/schema";
import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface StudyStatsProps {
  deckId: number;
}

export function StudyStats({ deckId }: StudyStatsProps) {
  const { data: sessions } = useQuery<StudySession[]>({
    queryKey: [`/api/decks/${deckId}/statistics`],
  });

  if (!sessions?.length) {
    return (
      <Card className="p-6">
        <p className="text-muted-foreground">No study sessions yet.</p>
      </Card>
    );
  }

  const totalTime = sessions.reduce((total, session) => {
    if (!session.endTime) return total;
    return total + (new Date(session.endTime).getTime() - new Date(session.startTime).getTime());
  }, 0);

  const totalCardsReviewed = sessions.reduce((total, session) => total + session.cardsReviewed, 0);
  const totalCardsLearned = sessions.reduce((total, session) => total + session.cardsLearned, 0);

  const chartData = sessions.map((session) => ({
    date: format(new Date(session.startTime), "MMM d"),
    cardsReviewed: session.cardsReviewed,
    cardsLearned: session.cardsLearned,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Total Study Time</h3>
          <p className="text-2xl font-bold mt-2">
            {formatDistanceStrict(0, totalTime, { unit: "minute" })}
          </p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Cards Reviewed</h3>
          <p className="text-2xl font-bold mt-2">{totalCardsReviewed}</p>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-muted-foreground">Cards Learned</h3>
          <p className="text-2xl font-bold mt-2">{totalCardsLearned}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">Progress Over Time</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="cardsReviewed"
                stroke="hsl(var(--primary))"
                name="Cards Reviewed"
              />
              <Line
                type="monotone"
                dataKey="cardsLearned"
                stroke="hsl(var(--chart-2))"
                name="Cards Learned"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

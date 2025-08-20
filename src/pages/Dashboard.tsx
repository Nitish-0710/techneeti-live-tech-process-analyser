import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Brain,
  Target,
  Zap,
  Lightbulb,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Code,
  User,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Editor from "@monaco-editor/react";

interface LogEntry {
  timestamp: number;
  action: string;
  type: "keystroke" | "paste" | "run";
  code?: string;
  details?: string;
}

interface AIFeedback {
  summary: string;
  strengths: string;
  ["Areas for Improvement"]: string;
  approach: string;
  logic: number;
  debugging: number;
  efficiency: number;
  creativity: number;
}

const Dashboard = () => {
  const [timelineValue, setTimelineValue] = useState([0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionData, setSessionData] = useState<{
    problem_statement: string;
    logs: LogEntry[];
    finalCode: string;
    completedAt: number;
  } | null>(null);
  const [currentCode, setCurrentCode] = useState("");
  const [aiAnalysis, setAiAnalysis] = useState<AIFeedback | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("codingSession");
    if (stored) {
      const data = JSON.parse(stored);
      setSessionData(data);
      setCurrentCode(data.finalCode);
    }
  }, []);

  const generateAIAnalysis = async (data: any) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch("http://localhost:5000/trigger-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          problem_statement: sessionData?.problem_statement,
          code_solution: data.finalCode,
          key_logs: data.logs,
        }),
      });

      console.log(data);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const analysisData = await response.json();

      const extracted = analysisData.p?.[0];

      console.log(extracted);

      const analysis: AIFeedback = {
        summary: extracted?.summary || "No summary available",
        strengths: extracted?.strength
          ? extracted.strength.split("\n").filter(Boolean)
          : [],
        ["Areas for Improvement"]: extracted?.["Areas for Improvement"]
          ? extracted["Areas for Improvement"].split("\n").filter(Boolean)
          : [],
        approach: "Not provided", // Or handle as optional
        logic: extracted?.logic || 0,
        debugging: extracted?.debugging || 0,
        efficiency: extracted?.efficiency || 0,
        creativity: extracted?.creativity || 0,
      };

      setAiAnalysis(analysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      toast.error(
        "Failed to generate analysis. Please check console for details."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const replayCodeAtTime = useCallback(
    (targetTime: number) => {
      if (!sessionData) return;

      // Find the last log entry before or at the target time
      const relevantLogs = sessionData.logs.filter(
        (log) => log.timestamp <= targetTime
      );
      if (relevantLogs.length === 0) {
        setCurrentCode(
          "function findLargestNumber(arr) {\n  // Write your solution here\n  \n}"
        );
        return;
      }

      const lastLog = relevantLogs[relevantLogs.length - 1];
      setCurrentCode(lastLog.code || sessionData.finalCode);
    },
    [sessionData]
  );

  const maxTime = sessionData
    ? Math.max(...sessionData.logs.map((l) => l.timestamp), 0)
    : 100;

  const metrics = aiAnalysis
    ? [
        {
          name: "Logic",
          value: aiAnalysis.logic,
          color: "hsl(var(--primary))",
        },
        {
          name: "Debugging",
          value: aiAnalysis.debugging,
          color: "hsl(var(--accent))",
        },
        {
          name: "Efficiency",
          value: aiAnalysis.efficiency,
          color: "hsl(var(--success))",
        },
        {
          name: "Creativity",
          value: aiAnalysis.creativity,
          color: "hsl(var(--warning))",
        },
      ]
    : [];

  useEffect(() => {
    if (!isPlaying || !sessionData) return;

    let start = Date.now();
    let interval = setInterval(() => {
      setTimelineValue((prev) => {
        const newValue = Math.min(100, prev[0] + 1); // increase progress %
        const targetTime = (newValue / 100) * maxTime;

        replayCodeAtTime(targetTime);

        if (newValue >= 100) {
          clearInterval(interval);
          setIsPlaying(false);
        }

        return [newValue];
      });
    }, 300); // playback speed (adjust for faster/slower)

    return () => clearInterval(interval);
  }, [isPlaying, sessionData, maxTime, replayCodeAtTime]);

  useEffect(() => {
    const stored = localStorage.getItem("codingSession");
    if (stored) {
      const responseFromWorqHat = JSON.parse(stored);
      setSessionData(responseFromWorqHat);

      if (responseFromWorqHat.aiAnalysis.data.data) {
        const raw = responseFromWorqHat.aiAnalysis.data.data.performance[0];

        const analysis: AIFeedback = {
          summary: raw.summary || "No summary provided",
          strengths: raw.strength,
          ["Areas for Improvement"]: raw["Areas for Improvement"],
          approach: raw.approach || "Approach not analyzed",
          logic: raw.logic || 0,
          debugging: raw.debugging || 0,
          efficiency: raw.efficiency || 0,
          creativity: raw.creativity || 0,
        };
        setAiAnalysis(analysis);
      } else {
        console.log("[useEffect] No existing analysis found. Generating...");
        setIsAnalyzing(true);
        generateAIAnalysis(
          responseFromWorqHat.aiAnalysis.data.data.performance[0]
        );
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Candidate Evaluation</h1>
            <p className="text-muted-foreground">
              {sessionData
                ? `Session completed ${new Date(
                    sessionData.completedAt
                  ).toLocaleTimeString()}`
                : "No session data"}
            </p>
            <p className="text-muted-foreground">
              {sessionData?.problem_statement || "No problem statement found"}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Anonymous</span>
            </Badge>
            <Badge variant="outline" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>
                {sessionData
                  ? `${Math.floor(maxTime / 60000)}:${Math.floor(
                      (maxTime % 60000) / 1000
                    )
                      .toString()
                      .padStart(2, "0")}`
                  : "0:00"}
              </span>
            </Badge>
          </div>
        </div>

        {/* Timeline Controls */}
        <Card className="mb-6 card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-primary" />
              <span>Coding Timeline Replay</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newValue = Math.max(0, timelineValue[0] - 10);
                  setTimelineValue([newValue]);
                  replayCodeAtTime((newValue / 100) * maxTime);
                }}
                disabled={!sessionData}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  if (!isPlaying) {
                    // If at start or end → reset
                    if (timelineValue[0] === 100 || timelineValue[0] === 0) {
                      setTimelineValue([0]);
                      replayCodeAtTime(0);
                    }
                  }
                  setIsPlaying(!isPlaying);
                }}
                disabled={!sessionData}
              >
                {isPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const newValue = Math.min(100, timelineValue[0] + 10);
                  setTimelineValue([newValue]);
                  replayCodeAtTime((newValue / 100) * maxTime);
                }}
                disabled={!sessionData}
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <div className="flex-1 px-4">
                <Slider
                  value={timelineValue}
                  onValueChange={(value) => {
                    setTimelineValue(value);
                    replayCodeAtTime((value[0] / 100) * maxTime);
                  }}
                  max={100}
                  step={1}
                  disabled={!sessionData}
                />
              </div>

              <span className="text-sm text-muted-foreground min-w-[60px]">
                {sessionData
                  ? (() => {
                      const currentTime = (timelineValue[0] / 100) * maxTime;
                      const minutes = Math.floor(currentTime / 60000);
                      const seconds = Math.floor((currentTime % 60000) / 1000);
                      return `${minutes}:${seconds
                        .toString()
                        .padStart(2, "0")}`;
                    })()
                  : "0:00"}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-20rem)]">
          {/* Code Snapshot */}
          <div className="lg:col-span-7">
            <Card className="h-full flex flex-col card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm font-medium">
                    {timelineValue[0] === 100
                      ? "Final Solution"
                      : "Code Replay"}
                  </span>
                  <Code className="ml-2 h-4 w-4 text-muted-foreground" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <div className="h-full">
                  <Editor
                    height="100%"
                    language="javascript"
                    theme="vs-dark"
                    value={currentCode}
                    options={{
                      readOnly: true,
                      fontSize: 14,
                      lineNumbers: "on",
                      roundedSelection: false,
                      scrollBeyondLastLine: false,
                      automaticLayout: true,
                      minimap: { enabled: false },
                      wordWrap: "on",
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side Panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* AI Feedback */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span>AI Analysis</span>
                  {isAnalyzing && (
                    <div className="ml-2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isAnalyzing ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center space-y-2">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      <p className="text-sm text-muted-foreground">
                        Analyzing coding approach...
                      </p>
                    </div>
                  </div>
                ) : aiAnalysis ? (
                  <ScrollArea className="h-64">
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Summary</h4>
                        <div className="prose prose-sm text-muted-foreground">
                          <ReactMarkdown>{aiAnalysis.summary}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-success/10">
                        <h4 className="font-medium mb-2 text-success flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Strengths
                        </h4>
                        <div className="prose prose-sm text-muted-foreground">
                          <ReactMarkdown>{aiAnalysis.strengths}</ReactMarkdown>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-warning/10">
                        <h4 className="font-medium mb-2 text-warning flex items-center">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Areas for Improvement
                        </h4>
                        <div className="prose prose-sm text-muted-foreground">
                          <ReactMarkdown>
                            {aiAnalysis["Areas for Improvement"]}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">
                      No session data available
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Performance Metrics */}
        <Card className="mt-20 card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span>Performance Breakdown</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {aiAnalysis ? (
              <div className="space-y-6">
                {/* Individual Metrics */}
                <div className="space-y-4">
                  {metrics.map((metric) => (
                    <div key={metric.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          {metric.name}
                        </span>
                        <span className="text-sm font-bold">
                          {metric.value}%
                        </span>
                      </div>
                      <Progress value={metric.value} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={metrics}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        dataKey="name"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <p className="text-muted-foreground">
                  Complete a coding session to see metrics
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

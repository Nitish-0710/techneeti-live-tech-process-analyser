import Navigation from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Clock, Activity, Keyboard, Play } from "lucide-react";
import { useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LogEntry {
  timestamp: number;
  action: string;
  type: "keystroke" | "paste" | "run";
  code?: string;
  details?: string;
}

const CodingInterface = () => {
  const navigate = useNavigate();
  const [code, setCode] = useState(`function findLargestNumber(arr) {
  // Write your solution here
  
}`);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const startTime = useRef(Date.now());
  const lastCode = useRef(code);

  const addLog = useCallback(
    (action: string, type: LogEntry["type"], details?: string) => {
      const logEntry: LogEntry = {
        timestamp: Date.now() - startTime.current,
        action,
        type,
        code: code,
        details,
      };
      setLogs((prev) => [...prev, logEntry]);
    },
    [code]
  );

  const codingQuestions = [
    "Two Sum - Find indices of two numbers that add up to a target.",
    "Sock Merchant - Count pairs of socks with matching colors.",
    "Enormous Input Test (INTEST) - Count numbers divisible by a given value.",
    "Longest Substring Without Repeating Characters - Find the length of the longest substring without repeating characters.",
    "Climbing the Leaderboard - Determine player ranks after each game score.",
    "Chef and Strings - Calculate total absolute differences between adjacent string values.",
    "Median of Two Sorted Arrays - Find the median of two sorted arrays efficiently.",
    "Matrix Layer Rotation - Rotate each layer of a 2D matrix a given number of times.",
    "K-Flip (KFLIP) - Maximize the number of 1s in a binary string with at most K flips.",
  ];

  const [selectedQuestion, setSelectedQuestion] = useState(() => {
    const index = Math.floor(Math.random() * codingQuestions.length);
    return codingQuestions[index];
  });

  const handleEditorDidMount = (editor, monaco) => {
    editor.onDidPaste(() => {
      addLog("Pasted content", "paste");
    });
  };

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value === undefined) return;

      const newCode = value;
      const oldCode = lastCode.current;

      if (newCode.length < oldCode.length) {
        // Any deletion, big or small
        const removedCount = oldCode.length - newCode.length;
        addLog(`Removed ${removedCount} characters`, "keystroke");
      } else if (newCode.length > oldCode.length) {
        // Additions that are NOT from paste (paste handled separately)
        const addedCount = newCode.length - oldCode.length;
        addLog(
          `Added ${addedCount} character${addedCount > 1 ? "s" : ""}`,
          "keystroke"
        );
      } else {
        // No change or something else, you can skip or log as needed
      }

      setCode(newCode);
      lastCode.current = newCode;
    },
    [addLog]
  );

  const handleRunCode = useCallback(() => {
    addLog("Executed code", "run");
    toast.success("Code executed successfully!");
  }, [addLog]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const timeDuration = Date.now() - startTime.current;

      const submissionData = {
        problem_statement: selectedQuestion,
        code_solution: code,
        key_logs: logs.filter((log) => log.type === "keystroke"),
        paste_events: logs.filter((log) => log.type === "paste"),
        code_runs: logs.filter((log) => log.type === "run"),
        time_duration: timeDuration,
        total_actions: logs.length,
      };

      // Send to server and wait for AI response
      const response = await fetch("http://localhost:5000/trigger-flow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Failed to submit to server");
      }

      const aiResponse = await response.json();

      // Store both session data and AI response
      const sessionData = {
        logs,
        finalCode: code,
        completedAt: Date.now(),
        aiAnalysis: aiResponse, // Store the AI response here
        problem_statement: selectedQuestion
      };

      localStorage.setItem("codingSession", JSON.stringify(sessionData));

      toast.success("Solution submitted successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit solution");
    } finally {
      setIsSubmitting(false);
    }
  }, [logs, code, navigate]);

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case "keystroke":
        return "bg-primary/10 text-primary";
      case "paste":
        return "bg-accent/10 text-accent";
      case "run":
        return "bg-success/10 text-success";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Coding Challenge</h1>
            <p className="text-muted-foreground">
              {selectedQuestion}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span>05:23</span>
            </Badge>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleRunCode}>
                <Play className="mr-2 h-4 w-4" />
                Run Code
              </Button>
              <Button
                className="btn-hero"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Solution
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 h-[calc(100vh-12rem)]">
          {/* Code Editor - 70% */}
          <div className="lg:col-span-7">
            <Card className="h-full card-modern">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="ml-4 text-sm font-medium">solution.js</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 h-[calc(100%-4rem)]">
                <Editor
                  height="100%"
                  language="javascript"
                  theme="vs-dark"
                  value={code}
                  onChange={handleEditorChange}
                  onMount={handleEditorDidMount}
                  options={{
                    fontSize: 14,
                    lineNumbers: "on",
                    roundedSelection: false,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                    minimap: { enabled: false },
                    wordWrap: "on",
                  }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Activity Panel - 30% */}
          <div className="lg:col-span-3 space-y-6">
            {/* Live Activity */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-primary animate-pulse" />
                  <span>Live Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {logs.slice(-10).map((log, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 animate-slide-in"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <Badge variant="outline" className="text-xs">
                          {formatTime(log.timestamp)}
                        </Badge>
                        <div className="flex-1">
                          <p className="text-sm">{log.action}</p>
                          <Badge
                            className={`text-xs mt-1 ${getActionColor(
                              log.type
                            )}`}
                          >
                            {log.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {logs.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Start typing to see activity...
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Real-time Stats */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Keyboard className="h-5 w-5 text-accent" />
                  <span>Session Stats</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Actions
                  </span>
                  <span className="font-semibold">{logs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Keystrokes
                  </span>
                  <span className="font-semibold">
                    {logs.filter((l) => l.type === "keystroke").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Paste Events
                  </span>
                  <span className="font-semibold">
                    {logs.filter((l) => l.type === "paste").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Code Runs
                  </span>
                  <span className="font-semibold">
                    {logs.filter((l) => l.type === "run").length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingInterface;

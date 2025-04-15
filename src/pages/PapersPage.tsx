
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PaperInfo } from "../types";
import { Download, FileText, Filter, Search, Calendar, Clock5 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// Mock data for papers
const papers: PaperInfo[] = [
  { id: "1", year: "2022", title: "Physics Class 12 CBSE Board Paper", downloadUrl: "#" },
  { id: "2", year: "2022", title: "Physics JEE Main Paper (February)" },
  { id: "3", year: "2021", title: "Physics Class 12 CBSE Board Paper" },
  { id: "4", year: "2021", title: "Physics JEE Main Paper (March)" },
  { id: "5", year: "2021", title: "Physics JEE Main Paper (July)" },
  { id: "6", year: "2021", title: "Physics JEE Main Paper (August)" },
  { id: "7", year: "2021", title: "Physics JEE Advanced Paper" },
  { id: "8", year: "2020", title: "Physics Class 12 CBSE Board Paper" },
  { id: "9", year: "2020", title: "Physics JEE Main Paper" },
  { id: "10", year: "2020", title: "Physics JEE Advanced Paper" },
  { id: "11", year: "2019", title: "Physics Class 12 CBSE Board Paper" },
  { id: "12", year: "2019", title: "Physics JEE Main Paper (January)" },
  { id: "13", year: "2019", title: "Physics JEE Main Paper (April)" },
  { id: "14", year: "2019", title: "Physics JEE Advanced Paper" }
];

const paperCategories = [
  { id: "cbse", name: "CBSE Board" },
  { id: "jeeMain", name: "JEE Main" },
  { id: "jeeAdv", name: "JEE Advanced" },
  { id: "neet", name: "NEET" }
];

const PapersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const availableYears = ["all", ...Array.from(new Set(papers.map((paper) => paper.year)))];

  const filteredPapers = papers.filter((paper) => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesYear = selectedYear === "all" || paper.year === selectedYear;
    const matchesCategory =
      selectedCategory === "all" ||
      (selectedCategory === "cbse" && paper.title.toLowerCase().includes("cbse")) ||
      (selectedCategory === "jeeMain" && paper.title.toLowerCase().includes("jee main")) ||
      (selectedCategory === "jeeAdv" && paper.title.toLowerCase().includes("jee advanced")) ||
      (selectedCategory === "neet" && paper.title.toLowerCase().includes("neet"));

    return matchesSearch && matchesYear && matchesCategory;
  });

  // Group papers by year
  const papersByYear = filteredPapers.reduce<{ [key: string]: PaperInfo[] }>((acc, paper) => {
    if (!acc[paper.year]) {
      acc[paper.year] = [];
    }
    acc[paper.year].push(paper);
    return acc;
  }, {});

  // Sort years in descending order
  const sortedYears = Object.keys(papersByYear).sort((a, b) => parseInt(b) - parseInt(a));

  // Function to get paper category from title
  const getPaperCategory = (title: string): string => {
    if (title.toLowerCase().includes("cbse")) return "CBSE";
    if (title.toLowerCase().includes("jee advanced")) return "JEE Advanced";
    if (title.toLowerCase().includes("jee main")) return "JEE Main";
    if (title.toLowerCase().includes("neet")) return "NEET";
    return "Other";
  };

  // Function to get paper category badge color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case "CBSE":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300";
      case "JEE Main":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300";
      case "JEE Advanced":
        return "bg-red-500/10 text-red-700 dark:text-red-300";
      case "NEET":
        return "bg-green-500/10 text-green-700 dark:text-green-300";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Previous Year Papers</h1>
        <p className="text-muted-foreground">
          Access and download past exam papers to improve your preparation
        </p>
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Browse Papers
          </TabsTrigger>
          <TabsTrigger value="collections" className="flex items-center gap-2">
            <Clock5 className="h-4 w-4" />
            Recent Attempts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          {/* Search and filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search papers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-36">
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year === "all" ? "All Years" : year}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All Categories</SelectItem>
                      {paperCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Display papers by year */}
          {filteredPapers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <FileText className="h-16 w-16 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium mb-2">No papers found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedYears.map((year) => (
                <div key={year} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">{year}</span>
                    </div>
                    <h2 className="text-xl font-semibold">{year} Papers</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {papersByYear[year].map((paper) => {
                      const category = getPaperCategory(paper.title);
                      const categoryColor = getCategoryColor(category);

                      return (
                        <Card
                          key={paper.id}
                          className="hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between group"
                        >
                          <div>
                            <div className="h-1.5 bg-gradient-to-r from-primary via-purple-500 to-blue-500"></div>
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-start">
                                <Badge variant="outline" className={`${categoryColor} font-medium`}>
                                  {category}
                                </Badge>
                              </div>
                              <CardTitle className="text-base mt-2 line-clamp-2">{paper.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="pb-0">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 mr-1" /> {paper.year}
                              </div>
                            </CardContent>
                          </div>
                          <CardFooter className="py-3 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full gap-2 group-hover:border-primary/50 transition-colors"
                              disabled={!paper.downloadUrl}
                            >
                              <Download className="h-4 w-4" />
                              {paper.downloadUrl ? "Download" : "Coming Soon"}
                            </Button>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="collections">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Clock5 className="h-16 w-16 text-muted-foreground/40 mb-4" />
            <h3 className="text-lg font-medium mb-2">No recent attempts</h3>
            <p className="text-muted-foreground mb-4">
              Your recently attempted papers will appear here
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                // Fix for the Element click error - use proper DOM querying with type checking
                const inactiveTab = document.querySelector('[data-state="inactive"]');
                if (inactiveTab && inactiveTab instanceof HTMLElement) {
                  inactiveTab.click();
                }
              }}
            >
              Browse available papers
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <Navbar />
    </div>
  );
};

export default PapersPage;

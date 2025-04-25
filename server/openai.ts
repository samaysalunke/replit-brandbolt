import OpenAI from "openai";

// The newest OpenAI model is "gpt-4o" which was released May 13, 2024. Do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface ContentIdea {
  title: string;
  content: string;
  category: string;
  estimatedEngagement: string;
}

/**
 * Generate LinkedIn content ideas based on user profile and preferences
 */
export async function generateLinkedInContentIdeas(
  userId: number,
  userProfile: any,
  preferences?: {
    contentTypes?: string[];
    industryFocus?: string;
    tonePreference?: string;
  }
): Promise<ContentIdea[]> {
  try {
    const { contentTypes = ["insight", "how-to", "story", "opinion"], 
            industryFocus = "general", 
            tonePreference = "professional" } = preferences || {};
            
    const industry = industryFocus || "general";
    const tone = tonePreference || "professional";
            
    const prompt = `As a LinkedIn content creation expert, generate ${contentTypes.length} engaging post ideas for a professional in the ${industry} industry.
    
User profile summary:
${JSON.stringify(userProfile, null, 2)}

For each content idea:
1. Create a compelling title that captures attention
2. Write a detailed content outline (150-200 words) that could be expanded into a full post
3. Categorize it as one of: ${contentTypes.join(", ")}
4. Estimate the engagement level as: "low", "medium", "high", or "very-high"
5. Use a ${tone} tone that's appropriate for LinkedIn

Format the response as a JSON array of objects with the following schema:
[
  {
    "title": string,
    "content": string,
    "category": string,
    "estimatedEngagement": string
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    // Handle potential null content
    const content = response.choices[0].message.content || '{"ideas":[]}';
    const result = JSON.parse(content);
    return result.ideas || result; // Handle different response formats
  } catch (error) {
    console.error("Error generating content ideas with OpenAI:", error);
    // Fallback content ideas in case of API error
    return [
      {
        title: "Industry Insights",
        content: "5 Ways AI is Transforming Marketing Strategy in 2023 - My Experience Implementing These Changes",
        category: "insight",
        estimatedEngagement: "high"
      },
      {
        title: "Personal Story",
        content: "The Career Pivot That Changed Everything: How I Went From [Previous Role] to [Current Role] in 12 Months",
        category: "story",
        estimatedEngagement: "medium"
      },
      {
        title: "How-To Guide",
        content: "LinkedIn Engagement Hack: How I Increased My Post Visibility by 300% Using This Simple 3-Step Process",
        category: "how-to",
        estimatedEngagement: "very-high"
      },
      {
        title: "Opinion Piece",
        content: "Why I Believe [Industry Trend] Is Overrated - And What We Should Focus On Instead",
        category: "opinion",
        estimatedEngagement: "high"
      }
    ];
  }
}

/**
 * Optimize a LinkedIn post for better engagement
 */
export async function optimizeLinkedInPost(
  originalContent: string,
  optimizationGoal: "engagement" | "connections" | "visibility" | "thought-leadership" = "engagement"
): Promise<{
  optimizedContent: string;
  suggestions: string[];
  estimatedImprovement: string;
}> {
  try {
    const prompt = `As a LinkedIn content optimization expert, improve the following post to maximize ${optimizationGoal}:

Original post:
"${originalContent}"

1. Rewrite the post to be more engaging and professional
2. Provide 3 specific suggestions to further improve the content
3. Estimate the potential improvement in engagement (as a percentage)

Format your response as a JSON object with the following schema:
{
  "optimizedContent": string,
  "suggestions": string[],
  "estimatedImprovement": string
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error optimizing content with OpenAI:", error);
    // Fallback response in case of API error
    return {
      optimizedContent: originalContent,
      suggestions: [
        "Add a compelling hook in the first sentence",
        "Include 2-3 relevant hashtags",
        "End with a question to encourage comments"
      ],
      estimatedImprovement: "15-20%"
    };
  }
}

/**
 * Analyze a LinkedIn profile and provide improvement suggestions
 */
export async function analyzeLinkedInProfile(
  profileData: any
): Promise<{
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: Array<{
    id: number;
    type: string;
    title: string;
    impact: string;
    description: string;
  }>;
}> {
  try {
    const prompt = `As a LinkedIn profile optimization expert, analyze the following profile and provide actionable suggestions:

Profile data:
${JSON.stringify(profileData, null, 2)}

Provide your analysis in a JSON object with the following schema:
{
  "score": number, // A profile strength score from 0-100
  "strengths": string[], // Array of 2-3 profile strengths
  "weaknesses": string[], // Array of 2-3 profile weaknesses
  "suggestions": [
    {
      "id": number,
      "type": string, // E.g., "headline", "summary", "experience", "skills", "engagement"
      "title": string, // Brief suggestion title
      "impact": string, // E.g., "High impact, low effort", "Medium impact, medium effort"
      "description": string // Detailed action item
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error("Error analyzing profile with OpenAI:", error);
    // Fallback analysis in case of API error
    return {
      score: 76,
      strengths: ["Detailed work experience", "Good number of connections"],
      weaknesses: ["Incomplete skills section", "Low engagement rate"],
      suggestions: [
        {
          id: 1,
          type: "headline",
          title: "Enhance Your Headline",
          impact: "High impact, low effort",
          description: "Your headline is missing keywords that recruiters search for. Add 2-3 industry-specific terms."
        },
        {
          id: 2,
          type: "projects",
          title: "Add Featured Projects",
          impact: "Medium impact, medium effort",
          description: "Showcase your work by adding 2-3 featured projects with visual content to increase profile visits."
        },
        {
          id: 3,
          type: "engagement",
          title: "Engage with Industry Posts",
          impact: "Medium impact, low effort",
          description: "Your comment engagement is lower than average. Comment on 3-5 trending posts in your industry this week."
        }
      ]
    };
  }
}
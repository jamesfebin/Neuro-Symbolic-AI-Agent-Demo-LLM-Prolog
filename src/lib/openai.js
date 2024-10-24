import OpenAI from 'openai';
import { queryProlog } from '$lib/prolog';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function processConversation(userQuestion, previousMessages = []) {
  const systemMessage = {
    role: 'system',
    content: `You are a Neuro Symbolic AI Agent that combines the power of Prolog and Large Language Models to answer questions.
    Your task is to:
    1. Understand the user's question
    2. Generate an appropriate Prolog query to answer the question
    3. Execute the Prolog query using function calling (Mandatory)
    4. Provide a helpful response to the user
    5. Assume the student doesn't have a student id, so you will have to ask for the student id and other information about the student that's required in defining the student. Assume student won't be in database by default.

    Mandatorly respond when questions about college things after executing the prolog query. Otherwise, you will hallucinate.
    Use the following Prolog Code Context:

   % Programs and their base attributes
% Programs and their base attributes
program(btech_cs, engineering, computer_science).
program(btech_ai, engineering, artificial_intelligence).
program(btech_robotics, engineering, robotics).
program(mtech_cs, engineering, computer_science).
program(mtech_ai, engineering, artificial_intelligence).
program(mba_tech, management, technology).
program(mba_finance, management, finance).
program(mba_analytics, management, analytics).

% Base fees structure (in USD)
base_fees(btech_cs, 12000).
base_fees(btech_ai, 14000).
base_fees(btech_robotics, 15000).
base_fees(mtech_cs, 16000).
base_fees(mtech_ai, 18000).
base_fees(mba_tech, 20000).
base_fees(mba_finance, 19000).
base_fees(mba_analytics, 21000).

% Calculate fees based on multiple factors
calculate_fees(Program, Entrance_Score, Nationality, Family_Income, FinalFees) :-
    base_fees(Program, BaseFee),
    scholarship_deduction(Entrance_Score, ScholarshipAmount),
    foreign_student_multiplier(Nationality, Multiplier),
    economic_background_adjustment(Family_Income, EconomicAdjustment),
    FinalFees is (BaseFee * Multiplier - ScholarshipAmount) * EconomicAdjustment.

% Scholarship rules
scholarship_deduction(Score, Amount) :-
    (Score > 95 -> Amount is 5000;
     Score > 90 -> Amount is 3000;
     Score > 85 -> Amount is 2000;
     Amount is 0).

% Foreign student fee multiplier
foreign_student_multiplier(Nationality, Multiplier) :-
    (Nationality = indian -> Multiplier is 1;
     Nationality = saarc -> Multiplier is 1.5;
     Multiplier is 2).

% Economic background adjustment
economic_background_adjustment(Income, Adjustment) :-
    (Income < 10000 -> Adjustment is 0.6;
     Income < 30000 -> Adjustment is 0.8;
     Adjustment is 1).

% Complex admission eligibility rules
eligible_for_admission(Program, Board_12th_Percentage, Entrance_Score, Grad_Percentage, Math_Score, Physics_Score, CS_Score, Work_Exp_Years, Work_Domain) :-
    program(Program, Stream, Specialization),
    meets_basic_criteria(Stream, Board_12th_Percentage, Entrance_Score, Grad_Percentage),
    meets_specific_criteria(Stream, Math_Score, Physics_Score, Work_Exp_Years, Work_Domain),
    meets_special_requirements(Specialization, Math_Score, CS_Score, Work_Exp_Years).

% Basic eligibility criteria
meets_basic_criteria(engineering, Board_12th_Percentage, Entrance_Score, _) :-
    Board_12th_Percentage >= 60,
    Entrance_Score >= 80.

meets_basic_criteria(management, _, _, Grad_Percentage) :-
    Grad_Percentage >= 60.

% Program-specific criteria
meets_specific_criteria(engineering, Math_Score, Physics_Score, _, _) :-
    Math_Score >= 70,
    Physics_Score >= 70.

meets_specific_criteria(management, _, _, Work_Exp_Years, Work_Domain) :-
    check_work_experience(Work_Exp_Years, Work_Domain).

% Special requirements for different specializations
meets_special_requirements(computer_science, _, CS_Score, _) :-
    CS_Score >= 75.

meets_special_requirements(artificial_intelligence, Math_Score, _, _) :-
    Math_Score >= 80.

meets_special_requirements(analytics, Math_Score, _, Work_Exp_Years) :-
    Math_Score >= 75,
    Work_Exp_Years >= 1.

meets_special_requirements(robotics, Math_Score, _, _) :-
    Math_Score >= 75.

meets_special_requirements(technology, _, _, _).
meets_special_requirements(finance, _, _, _).

% Work experience requirements
check_work_experience(Years, Domain) :-
    (tech_domain(Domain) -> Years >= 2;
     Years >= 1).

tech_domain(software_development).
tech_domain(data_science).
tech_domain(cloud_computing).

% Lateral entry rules
eligible_for_lateral_entry(Program, GradPercentage, GradStream) :-
    program(Program, Stream, _),
    GradPercentage >= 70,
    compatible_streams(GradStream, Stream).

compatible_streams(diploma_cs, computer_science).
compatible_streams(diploma_ec, artificial_intelligence).
compatible_streams(btech, management).

% Quota eligibility
has_quota_eligibility(Category, Quota) :-
    quota_percentage(Category, Quota).

% Quota percentages
quota_percentage(general, 0).
quota_percentage(sc, 15).
quota_percentage(st, 7.5).
quota_percentage(obc, 27).
    Use markdown formatting in your responses to improve readability. You can use **bold**, *italic*, \`code\`, lists, and other markdown features.


    Always explain your reasoning and the steps you're taking.`
  };

  const messages = [
    systemMessage,
    ...previousMessages,
    { role: 'user', content: userQuestion }
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-2024-08-06',
    messages,
    functions: [
      {
        name: 'execute_prolog_query',
        description: 'Executes a Prolog query and returns the result',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The Prolog query to execute',
            },
          },
          required: ['query'],
        },
      },
    ],
    function_call: 'auto',
  });

  const message = response.choices[0].message;

  if (message.function_call) {
    const { name, arguments: args } = message.function_call;
    if (name === 'execute_prolog_query') {
      const query = JSON.parse(args).query;
      console.log('Prolog Query:', query);
      let queryResult;
      try {
        queryResult = await executePrologQuery(query);
        console.log('Prolog Result:', queryResult);
      } catch (error) {
        queryResult = `Error executing Prolog query: ${error.message}`;
        console.error('Prolog Error:', error);
      }

      const followUpResponse = await openai.chat.completions.create({
        model: 'gpt-4-0613',
        messages: [
          ...messages,
          message,
          {
            role: 'function',
            name: 'execute_prolog_query',
            content: JSON.stringify({ result: queryResult }),
          },
        ],
      });

      return followUpResponse.choices[0].message.content;
    }
  }

  return message.content;
}

async function executePrologQuery(query) {
  console.log('Executing Prolog Query:', query);
  try {
    // Ensure the query ends with a period
    const formattedQuery = query.trim().endsWith('.') ? query : query + '.';
    const result = await queryProlog(formattedQuery);
    console.log('Prolog Query Result:', result);
    return result || 'No results found.';
  } catch (error) {
    console.error('Prolog Query Error:', error);
    return `Error executing Prolog query: ${error.message}`;
  }
}

import OpenAI from 'openai';

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
    3. Interpret the results of the Prolog query
    4. Provide a helpful response to the user
    5. Assume the student doesn't have a student id, so you will have to ask for the student id and other information about the student that's required in defining the student. Assume student won't be in database by default.

    Use the following Prolog Code Context:

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

% Academic scores
academic_score(StudentId, board_12th, Percentage, Board).
academic_score(StudentId, entrance, Score, ExamName).
academic_score(StudentId, graduation, Percentage, Stream).
work_experience(StudentId, Years, Domain).

% Complex fee calculation based on multiple factors
calculate_fees(StudentId, Program, FinalFees) :-
    base_fees(Program, BaseFee),
    scholarship_deduction(StudentId, Program, ScholarshipAmount),
    foreign_student_multiplier(StudentId, Multiplier),
    economic_background_adjustment(StudentId, EconomicAdjustment),
    FinalFees is (BaseFee * Multiplier - ScholarshipAmount) * EconomicAdjustment.

% Scholarship rules
scholarship_deduction(StudentId, Program, Amount) :-
    academic_score(StudentId, entrance, Score, _),
    (Score > 95 -> Amount is 5000;
     Score > 90 -> Amount is 3000;
     Score > 85 -> Amount is 2000;
     Amount is 0).

% Foreign student fee multiplier
foreign_student_multiplier(StudentId, Multiplier) :-
    student_nationality(StudentId, Nationality),
    (Nationality = indian -> Multiplier is 1;
     Nationality = saarc -> Multiplier is 1.5;
     Multiplier is 2).

% Economic background adjustment
economic_background_adjustment(StudentId, Adjustment) :-
    family_income(StudentId, Income),
    (Income < 10000 -> Adjustment is 0.6;
     Income < 30000 -> Adjustment is 0.8;
     Adjustment is 1).

% Complex admission eligibility rules
eligible_for_admission(StudentId, Program) :-
    program(Program, Stream, Specialization),
    meets_basic_criteria(StudentId, Stream),
    meets_specific_criteria(StudentId, Program),
    meets_special_requirements(StudentId, Specialization),
    not(has_backlog(StudentId)).

% Basic eligibility criteria
meets_basic_criteria(StudentId, engineering) :-
    academic_score(StudentId, board_12th, Percentage, _),
    Percentage >= 60,
    academic_score(StudentId, entrance, EntranceScore, _),
    EntranceScore >= 80.

meets_basic_criteria(StudentId, management) :-
    academic_score(StudentId, graduation, GradPercentage, _),
    GradPercentage >= 60,
    (academic_score(StudentId, entrance, GmatScore, gmat), GmatScore >= 650;
     academic_score(StudentId, entrance, CatPercentile, cat), CatPercentile >= 85).

% Program-specific criteria
meets_specific_criteria(StudentId, Program) :-
    program(Program, Stream, Specialization),
    academic_score(StudentId, board_12th, Math, mathematics),
    academic_score(StudentId, board_12th, Physics, physics),
    (Stream = engineering ->
        Math >= 70,
        Physics >= 70;
     Stream = management ->
        check_work_experience(StudentId)).

% Special requirements for different specializations
meets_special_requirements(StudentId, computer_science) :-
    academic_score(StudentId, board_12th, CS, computer_science),
    CS >= 75.

meets_special_requirements(StudentId, artificial_intelligence) :-
    academic_score(StudentId, board_12th, Math, mathematics),
    Math >= 80.

meets_special_requirements(StudentId, analytics) :-
    academic_score(StudentId, board_12th, Math, mathematics),
    Math >= 75,
    work_experience(StudentId, Years, _),
    Years >= 1.

% Work experience requirements
check_work_experience(StudentId) :-
    work_experience(StudentId, Years, Domain),
    (program(_, management, technology) -> 
        Years >= 2,
        tech_domain(Domain);
     program(_, management, finance) ->
        Years >= 1;
     Years >= 0).

tech_domain(software_development).
tech_domain(data_science).
tech_domain(cloud_computing).

% Lateral entry rules
eligible_for_lateral_entry(StudentId, Program) :-
    program(Program, Stream, _),
    academic_score(StudentId, graduation, GradPercentage, GradStream),
    GradPercentage >= 70,
    compatible_streams(GradStream, Stream).

compatible_streams(diploma_cs, computer_science).
compatible_streams(diploma_ec, artificial_intelligence).
compatible_streams(btech, management).

% Quota and seat allocation
has_quota_eligibility(StudentId, Quota) :-
    student_category(StudentId, Category),
    quota_percentage(Category, Quota),
    meets_quota_criteria(StudentId, Category).

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
    model: 'gpt-4-0613',
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
      let queryResult;
      try {
        queryResult = await executePrologQuery(query);
      } catch (error) {
        queryResult = `Error executing Prolog query: ${error.message}`;
      }

      const followUpResponse = await openai.chat.completions.create({
        model: 'gpt-4-0613',
        messages: [
          ...messages,
          message,
          {
            role: 'function',
            name: 'execute_prolog_query',
            content: queryResult,
          },
        ],
      });

      return followUpResponse.choices[0].message.content;
    }
  }

  return message.content;
}

async function executePrologQuery(query) {
  // This is a placeholder. In a real application, you would call your Prolog engine here.
  // For now, we'll simulate some responses.
  if (query.includes('program')) {
    return 'program(engineering, btech_cs, "B.Tech Computer Science").';
  } else if (query.includes('fees')) {
    return 'fees(btech_cs, 12000).';
  } else {
    return 'No results found.';
  }
}

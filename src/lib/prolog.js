// import pl from 'tau-prolog';
// // Import required modules
// import 'tau-prolog/modules/core';
// import 'tau-prolog/modules/lists';
// import 'tau-prolog/modules/js';


let session;

export async function initializeProlog() {
  // Create a new Prolog session
  session = pl.create(1000);  // Increase the session limit if needed

  // Load the necessary modules
  await session.consult(":- use_module(library(lists)).");
  await session.consult(":- use_module(library(js)).");

  // Consult the Prolog code
  const program = `
    % Prolog Code
    % Facts about Engineering Programs
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
  `;

  session.consult(program);
}

export function queryProlog(query) {
  return new Promise((resolve, reject) => {
    session.query(query, {
      success: function () {
        session.answers((answer) => {
          if (answer === false) {
            resolve([]);
          } else {
            const formattedAnswer = session.format_answer(answer);
            resolve([formattedAnswer]);
          }
        });
      },
      error: function (err) {
        reject(err);
      },
    });
  });
}

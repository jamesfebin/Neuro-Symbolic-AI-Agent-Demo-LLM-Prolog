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

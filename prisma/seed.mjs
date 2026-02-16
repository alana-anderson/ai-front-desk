import "dotenv/config";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.knowledge.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({
    data: { name: "123 Preschool", slug: "123-preschool" },
  });

  await prisma.user.createMany({
    data: [
      { name: "Leslie Knope", email: "leslie@123preschool.com", role: "admin", organizationId: org.id },
      { name: "Dwight Schrute", email: "dwight@123preschool.com", role: "staff", organizationId: org.id },
      { name: "Monica Geller", email: "monica@parent.com", role: "parent", organizationId: org.id },
      { name: "David Rose", email: "david@parent.com", role: "parent", organizationId: org.id },
    ],
  });

  await prisma.knowledge.createMany({
    data: [
      { organizationId: org.id, category: "hours", question: "What are the hours of operation?", answer: "123 Preschool is open Monday through Friday, 7:00 AM to 5:30 PM. Pre-K program hours are 8:00 AM to 2:30 PM, with extended care available from 2:30 PM to 5:30 PM.", source: "manual" },
      { organizationId: org.id, category: "closures", question: "What holidays is the school closed?", answer: "123 Preschool is closed on the following holidays: New Year's Day, Martin Luther King Jr. Day, Presidents' Day, Memorial Day, Independence Day, Labor Day, Veterans Day, Thanksgiving (Thursday and Friday), and winter break (Dec 23 – Jan 1). A full calendar of closure dates is provided at enrollment.", source: "manual", metadata: { closures: ["2026-01-01","2026-01-19","2026-02-16","2026-05-25","2026-07-03","2026-09-07","2026-11-11","2026-11-26","2026-11-27"] } },
      { organizationId: org.id, category: "sick_policy", question: "What is the sick policy? Can my child come in with a fever?", answer: "For the safety of all children and staff, please keep your child home if they have: a fever of 100.4°F or higher (or had one within the last 24 hours), vomiting or diarrhea within 24 hours, pink eye or symptoms of conjunctivitis, a cloudy runny nose, been on antibiotics for less than 24 hours, symptoms of any contagious disease, or an undiagnosed rash. Your child must be symptom-free for 24 hours before returning. A doctor's note may be required.", source: "manual" },
      { organizationId: org.id, category: "tuition", question: "What is the tuition? How much does it cost?", answer: "Tuition at 123 Preschool is based on a graduated fee schedule determined by family income and household size. Fees are minimal, non-refundable, and must be paid in advance of services regardless of attendance. There is an additional fee for siblings and for Pre-K Extended Care. Please contact the enrollment office at (505) 767-6500 for your specific rate. Late pickup after closing incurs a $15 fee per occurrence.", source: "manual" },
      { organizationId: org.id, category: "meals", question: "Does the school provide lunch? Can I bring outside food?", answer: "Yes! 123 Preschool participates in the Child and Adult Care Food Program (CACFP). Nutritious breakfast, lunch, and snacks are provided daily at no additional cost. Please do not bring outside food into the center — exceptions may be granted by the Head Teacher for allergies or birthdays (store-bought with nutrition label only). If your child has a food allergy, a Nutrition/Allergy form signed by a doctor must be on file. We limit peanut products and request peanut-free snacks.", source: "manual" },
      { organizationId: org.id, category: "daily_meal", question: "What is the weekly lunch menu?", answer: "Monday: Chicken nuggets, apple slices, milk. Tuesday: Turkey and cheese wraps, carrot sticks, juice. Wednesday: Pasta with marinara, green beans, milk. Thursday: Grilled cheese, tomato soup, apple juice. Friday: Fish sticks, coleslaw, milk. Breakfast is served daily from 7:00–9:00 AM. An afternoon snack is provided at 2:30 PM.", source: "manual", metadata: { monday: "Chicken nuggets, apple slices, milk", tuesday: "Turkey and cheese wraps, carrot sticks, juice", wednesday: "Pasta with marinara, green beans, milk", thursday: "Grilled cheese, tomato soup, apple juice", friday: "Fish sticks, coleslaw, milk" } },
      { organizationId: org.id, category: "snow_day", question: "What happens on snow days?", answer: "123 Preschool follows the Albuquerque Public Schools (APS) schedule for snow days. If APS announces a two-hour delay, we open at 10:00 AM (no breakfast served). If APS announces early dismissal, we will also close and contact families. If APS closes entirely, all centers close. Please check local radio/TV or the APS website before leaving home.", source: "manual" },
      { organizationId: org.id, category: "tours", question: "How do I schedule a tour?", answer: "We'd love to show you around! To schedule a tour of 123 Preschool, please call us at (505) 767-6500 or email info@123preschool.com. Tours are available Monday through Friday between 9:00 AM and 4:00 PM. You're also welcome to visit your child's classroom at any time — we have an open-door policy!", source: "manual" },
      { organizationId: org.id, category: "late_pickup", question: "What is the late pickup policy?", answer: "If your child is picked up after the center closes, a late fee of $15.00 per occurrence will be charged. If a child is left 30 minutes after closing and we cannot reach any emergency contacts, we are required to contact the Albuquerque Police Department and Child Protective Services. Please make sure your emergency contact information is always up to date.", source: "manual" },
      { organizationId: org.id, category: "extra_clothes", question: "Does my child need extra clothes at school?", answer: "Yes! Please provide at least one extra set of labeled clothing (shirt, pants, socks, underpants) to keep at the center at all times. Children participate in messy activities, and accidents happen. If extra clothes are not available, parents will be called to bring a change of clothing. Dress your child in comfortable, washable school clothes and closed-toe shoes. Open-toe sandals and shoes with roller wheels are not allowed.", source: "manual" },
      { organizationId: org.id, category: "curriculum", question: "What curriculum does the school use?", answer: "123 Preschool uses the Creative Curriculum framework for ages 3–5. Our teaching staff plans activities based on children's interests, including language and literacy, math and science, social studies, art, music, and gross/fine motor skills. We follow a play-based approach — children learn through exploration, investigation, and hands-on activities. We are NAEYC accredited and recognized as a 5-Star Center by the state of New Mexico.", source: "manual" },
      { organizationId: org.id, category: "contact", question: "How do I contact the school?", answer: "You can reach 123 Preschool at: Phone: (505) 767-6500, Email: info@123preschool.com, Address: 1820 Randolph Rd SE, Albuquerque, NM 87106. Office hours: Monday–Friday, 8:00 AM – 4:30 PM. For enrollment inquiries, contact the enrollment office at (505) 767-6504.", source: "manual" },
      { organizationId: org.id, category: "enrollment", question: "How do I enroll my child?", answer: "Enrollment at 123 Preschool involves several steps: (1) Call the enrollment office at (505) 767-6504 for a phone prequalification. (2) Provide documentation (child's birth certificate, immunization records, emergency contacts, proof of income). (3) Sign the parent agreement and receive the Parent Handbook. (4) Attend a mandatory parent meeting. (5) Orientation at the center with your child's teacher. Children must be 3–5 years old for Preschool, and 4 by September 1st for Pre-K.", source: "manual" },
      { organizationId: org.id, category: "attendance", question: "What is the attendance policy?", answer: "Children are expected to attend full-time: 6.5 hours per day, 5 days a week. Please notify the center daily if your child will be absent. If there is no contact for two consecutive weeks of absence, your child may be disenrolled. For Preschool and Pre-K Extended Care, please arrive no later than 9:00 AM so your child can participate in program time.", source: "manual" },
      { organizationId: org.id, category: "upcoming_event", question: "What events are coming up?", answer: "Upcoming events at 123 Preschool: Picture Day on Thursday, February 19th — send your child in their best outfit! Parent-Teacher Conferences the week of March 2nd — sign up at the front desk. Spring Field Trip to the zoo on March 20th — permission forms will be sent home soon.", source: "manual", metadata: { events: [{ name: "Picture Day", date: "2026-02-19" }, { name: "Parent-Teacher Conferences", date: "2026-03-02" }, { name: "Spring Field Trip to the Zoo", date: "2026-03-20" }] } },
    ],
  });

  console.log("Seed complete: 1 org, 4 users, 15 knowledge entries");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });

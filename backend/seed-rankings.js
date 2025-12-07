// filepath: backend/seed-rankings.js
const mongoose = require('mongoose');
const Ranking = require('./models/Ranking');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/opencric';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Seeding Rankings...');
    
    // --- BATTING ---
    const men_test_batting = { category: 'men_test_batting', players: [
        { rank: 1, name: "Joe Root", team: "England", rating: 884 },
        { rank: 2, name: "Harry Brook", team: "England", rating: 853 },
        { rank: 3, name: "Kane Williamson", team: "New Zealand", rating: 850 },
        { rank: 4, name: "Steven Smith", team: "Australia", rating: 809 },
        { rank: 5, name: "Travis Head", team: "Australia", rating: 792 },
        { rank: 6, name: "Kamindu Mendis", team: "Sri Lanka", rating: 781 },
        { rank: 7, name: "Temba Bavuma", team: "South Africa", rating: 775 },
        { rank: 8, name: "Yashasvi Jaiswal", team: "India", rating: 750 },
        { rank: 9, name: "Daryl Mitchell", team: "New Zealand", rating: 748 },
        { rank: 10, name: "Ben Duckett", team: "England", rating: 739 },
        { rank: 11, name: "Saud Shakeel", team: "Pakistan", rating: 734 },
        { rank: 12, name: "Shubman Gill", team: "India", rating: 730 },
        { rank: 13, name: "Dinesh Chandimal", team: "Sri Lanka", rating: 717 },
        { rank: 14, name: "Rishabh Pant", team: "India", rating: 704 },
        { rank: 15, name: "Pathum Nissanka", team: "Sri Lanka", rating: 685 }
    ]};

    const men_odi_batting = { category: 'men_odi_batting', players: [
        { rank: 1, name: "Rohit Sharma", team: "India", rating: 783 },
        { rank: 2, name: "Daryl Mitchell", team: "New Zealand", rating: 766 },
        { rank: 3, name: "Ibrahim Zadran", team: "Afghanistan", rating: 764 },
        { rank: 4, name: "Virat Kohli", team: "India", rating: 751 },
        { rank: 5, name: "Shubman Gill", team: "India", rating: 738 },
        { rank: 6, name: "Babar Azam", team: "Pakistan", rating: 722 },
        { rank: 7, name: "Harry Tector", team: "Ireland", rating: 708 },
        { rank: 8, name: "Shai Hope", team: "West Indies", rating: 701 },
        { rank: 9, name: "Shreyas Iyer", team: "India", rating: 693 },
        { rank: 10, name: "Charith Asalanka", team: "Sri Lanka", rating: 690 },
        { rank: 11, name: "Travis Head", team: "Australia", rating: 653 },
        { rank: 12, name: "Rachin Ravindra", team: "New Zealand", rating: 645 },
        { rank: 13, name: "Pathum Nissanka", team: "Sri Lanka", rating: 639 },
        { rank: 14, name: "KL Rahul", team: "India", rating: 638 },
        { rank: 14, name: "Kusal Mendis", team: "Sri Lanka", rating: 638 }
    ]};

    const men_t20_batting = { category: 'men_t20_batting', players: [
        { rank: 1, name: "Abhishek Sharma", team: "India", rating: 920 },
        { rank: 2, name: "Philip Salt", team: "England", rating: 849 },
        { rank: 3, name: "Pathum Nissanka", team: "Sri Lanka", rating: 779 },
        { rank: 4, name: "Jos Buttler", team: "England", rating: 770 },
        { rank: 5, name: "Tilak Varma", team: "India", rating: 761 },
        { rank: 6, name: "Sahibzada Farhan", team: "Pakistan", rating: 752 },
        { rank: 7, name: "Travis Head", team: "Australia", rating: 713 },
        { rank: 8, name: "Suryakumar Yadav", team: "India", rating: 691 },
        { rank: 9, name: "Mitchell Marsh", team: "Australia", rating: 684 },
        { rank: 10, name: "Tim Seifert", team: "New Zealand", rating: 683 },
        { rank: 11, name: "Dewald Brevis", team: "South Africa", rating: 672 },
        { rank: 12, name: "Tim David", team: "Australia", rating: 665 },
        { rank: 13, name: "Shai Hope", team: "West Indies", rating: 664 },
        { rank: 14, name: "Kusal Perera", team: "Sri Lanka", rating: 658 },
        { rank: 15, name: "Tim Robinson", team: "New Zealand", rating: 655 }
    ]};

    // --- BOWLING ---
    const men_test_bowling = { category: 'men_test_bowling', players: [
        { rank: 1, name: "Jasprit Bumrah", team: "India", rating: 879 },
        { rank: 2, name: "Matt Henry", team: "New Zealand", rating: 846 },
        { rank: 3, name: "Noman Ali", team: "Pakistan", rating: 843 },
        { rank: 4, name: "Pat Cummins", team: "Australia", rating: 830 },
        { rank: 5, name: "Marco Jansen", team: "South Africa", rating: 825 },
        { rank: 6, name: "Mitchell Starc", team: "Australia", rating: 820 },
        { rank: 7, name: "Kagiso Rabada", team: "South Africa", rating: 807 },
        { rank: 7, name: "Josh Hazlewood", team: "Australia", rating: 807 },
        { rank: 9, name: "Scott Boland", team: "Australia", rating: 785 },
        { rank: 10, name: "Nathan Lyon", team: "Australia", rating: 765 },
        { rank: 11, name: "Simon Harmer", team: "South Africa", rating: 721 },
        { rank: 12, name: "Gus Atkinson", team: "England", rating: 710 },
        { rank: 13, name: "Mohammed Siraj", team: "India", rating: 707 },
        { rank: 14, name: "Ravindra Jadeja", team: "India", rating: 698 },
        { rank: 15, name: "Kuldeep Yadav", team: "India", rating: 694 }
    ]};

    const men_odi_bowling = { category: 'men_odi_bowling', players: [
        { rank: 1, name: "Rashid Khan", team: "Afghanistan", rating: 710 },
        { rank: 2, name: "Jofra Archer", team: "England", rating: 670 },
        { rank: 3, name: "Keshav Maharaj", team: "South Africa", rating: 653 },
        { rank: 4, name: "Maheesh Theekshana", team: "Sri Lanka", rating: 647 },
        { rank: 5, name: "Bernard Scholtz", team: "Namibia", rating: 645 },
        { rank: 6, name: "Kuldeep Yadav", team: "India", rating: 641 },
        { rank: 7, name: "Mitchell Santner", team: "New Zealand", rating: 636 },
        { rank: 8, name: "Josh Hazlewood", team: "Australia", rating: 628 },
        { rank: 9, name: "Abrar Ahmed", team: "Pakistan", rating: 624 },
        { rank: 10, name: "Wanindu Hasaranga", team: "Sri Lanka", rating: 619 },
        { rank: 10, name: "Matt Henry", team: "New Zealand", rating: 619 },
        { rank: 12, name: "Adil Rashid", team: "England", rating: 603 },
        { rank: 13, name: "Adam Zampa", team: "Australia", rating: 601 },
        { rank: 14, name: "Ravindra Jadeja", team: "India", rating: 588 },
        { rank: 15, name: "Saurabh Netravalkar", team: "USA", rating: 582 }
    ]};

    const men_t20_bowling = { category: 'men_t20_bowling', players: [
        { rank: 1, name: "Varun Chakaravarthy", team: "India", rating: 780 },
        { rank: 2, name: "Jacob Duffy", team: "New Zealand", rating: 699 },
        { rank: 3, name: "Rashid Khan", team: "Afghanistan", rating: 694 },
        { rank: 4, name: "Abrar Ahmed", team: "Pakistan", rating: 691 },
        { rank: 5, name: "Wanindu Hasaranga", team: "Sri Lanka", rating: 687 },
        { rank: 6, name: "Adil Rashid", team: "England", rating: 686 },
        { rank: 7, name: "Akeal Hosein", team: "West Indies", rating: 675 },
        { rank: 8, name: "Mustafizur Rahman", team: "Bangladesh", rating: 665 },
        { rank: 9, name: "Nathan Ellis", team: "Australia", rating: 660 },
        { rank: 10, name: "Adam Zampa", team: "Australia", rating: 655 },
        { rank: 11, name: "Mohammad Nawaz", team: "Pakistan", rating: 647 },
        { rank: 12, name: "Josh Hazlewood", team: "Australia", rating: 646 },
        { rank: 13, name: "Nuwan Thushara", team: "Sri Lanka", rating: 635 },
        { rank: 14, name: "Mahedi Hasan", team: "Bangladesh", rating: 634 },
        { rank: 15, name: "Axar Patel", team: "India", rating: 628 }
    ]};

    // --- ALL ROUNDERS ---
    const men_test_allrounder = { category: 'men_test_allrounder', players: [
        { rank: 1, name: "Ravindra Jadeja", team: "India", rating: 455 },
        { rank: 2, name: "Marco Jansen", team: "South Africa", rating: 344 },
        { rank: 3, name: "Ben Stokes", team: "England", rating: 306 },
        { rank: 4, name: "Mehidy Hasan Miraz", team: "Bangladesh", rating: 299 },
        { rank: 5, name: "Pat Cummins", team: "Australia", rating: 265 },
        { rank: 6, name: "Mitchell Starc", team: "Australia", rating: 255 },
        { rank: 7, name: "Wiaan Mulder", team: "South Africa", rating: 245 },
        { rank: 8, name: "Gus Atkinson", team: "England", rating: 237 },
        { rank: 9, name: "Joe Root", team: "England", rating: 230 },
        { rank: 10, name: "Mitchell Santner", team: "New Zealand", rating: 225 },
        { rank: 11, name: "Matt Henry", team: "New Zealand", rating: 203 },
        { rank: 12, name: "Washington Sundar", team: "India", rating: 202 },
        { rank: 12, name: "Axar Patel", team: "India", rating: 202 },
        { rank: 14, name: "Kagiso Rabada", team: "South Africa", rating: 197 },
        { rank: 15, name: "Shamar Joseph", team: "West Indies", rating: 188 }
    ]};

    const men_odi_allrounder = { category: 'men_odi_allrounder', players: [
        { rank: 1, name: "Azmatullah Omarzai", team: "Afghanistan", rating: 334 },
        { rank: 2, name: "Sikandar Raza", team: "Zimbabwe", rating: 302 },
        { rank: 3, name: "Mohammad Nabi", team: "Afghanistan", rating: 285 },
        { rank: 4, name: "Mehidy Hasan Miraz", team: "Bangladesh", rating: 273 },
        { rank: 5, name: "Rashid Khan", team: "Afghanistan", rating: 257 },
        { rank: 6, name: "Mitchell Santner", team: "New Zealand", rating: 255 },
        { rank: 7, name: "Michael Bracewell", team: "New Zealand", rating: 239 },
        { rank: 8, name: "Wanindu Hasaranga", team: "Sri Lanka", rating: 234 },
        { rank: 9, name: "Brandon McMullen", team: "Scotland", rating: 228 },
        { rank: 10, name: "Axar Patel", team: "India", rating: 225 },
        { rank: 11, name: "Ravindra Jadeja", team: "India", rating: 208 },
        { rank: 12, name: "Gerhard Erasmus", team: "Namibia", rating: 204 },
        { rank: 13, name: "Josh Hazlewood", team: "Australia", rating: 197 },
        { rank: 14, name: "Salman Agha", team: "Pakistan", rating: 196 },
        { rank: 15, name: "Sean Williams", team: "Zimbabwe", rating: 189 }
    ]};

    const men_t20_allrounder = { category: 'men_t20_allrounder', players: [
        { rank: 1, name: "Saim Ayub", team: "Pakistan", rating: 295 },
        { rank: 2, name: "Sikandar Raza", team: "Zimbabwe", rating: 289 },
        { rank: 3, name: "Roston Chase", team: "West Indies", rating: 252 },
        { rank: 4, name: "Mohammad Nawaz", team: "Pakistan", rating: 218 },
        { rank: 5, name: "Mohammad Nabi", team: "Afghanistan", rating: 213 },
        { rank: 6, name: "Romario Shepherd", team: "West Indies", rating: 212 },
        { rank: 7, name: "Hardik Pandya", team: "India", rating: 211 },
        { rank: 8, name: "Dipendra Singh Airee", team: "Nepal", rating: 202 },
        { rank: 9, name: "Azmatullah Omarzai", team: "Afghanistan", rating: 184 },
        { rank: 10, name: "Axar Patel", team: "India", rating: 180 },
        { rank: 11, name: "Wanindu Hasaranga", team: "Sri Lanka", rating: 177 },
        { rank: 12, name: "Marcus Stoinis", team: "Australia", rating: 175 },
        { rank: 13, name: "Rashid Khan", team: "Afghanistan", rating: 174 },
        { rank: 14, name: "Liam Livingstone", team: "England", rating: 171 },
        { rank: 15, name: "Jason Holder", team: "West Indies", rating: 164 }
    ]};

    // --- TEAMS ---
    const men_test_team = { category: 'men_test_team', players: [
        { rank: 1, team: "Australia", rating: 124 },
        { rank: 2, team: "South Africa", rating: 116 },
        { rank: 3, team: "England", rating: 112 },
        { rank: 4, team: "India", rating: 104 },
        { rank: 5, team: "New Zealand", rating: 96 },
        { rank: 6, team: "Sri Lanka", rating: 88 },
        { rank: 7, team: "Pakistan", rating: 82 },
        { rank: 8, team: "West Indies", rating: 70 },
        { rank: 9, team: "Bangladesh", rating: 63 },
        { rank: 10, team: "Ireland", rating: 23 },
        { rank: 11, team: "Zimbabwe", rating: 12 },
        { rank: 12, team: "Afghanistan", rating: 10 }
    ]};

    const men_odi_team = { category: 'men_odi_team', players: [
        { rank: 1, team: "India", rating: 120 },
        { rank: 2, team: "New Zealand", rating: 113 },
        { rank: 3, team: "Australia", rating: 109 },
        { rank: 4, team: "Pakistan", rating: 105 },
        { rank: 5, team: "Sri Lanka", rating: 100 },
        { rank: 6, team: "South Africa", rating: 99 },
        { rank: 7, team: "Afghanistan", rating: 95 },
        { rank: 8, team: "England", rating: 86 },
        { rank: 9, team: "West Indies", rating: 77 },
        { rank: 10, team: "Bangladesh", rating: 76 },
        { rank: 11, team: "Zimbabwe", rating: 54 },
        { rank: 12, team: "Ireland", rating: 52 },
        { rank: 13, team: "Scotland", rating: 46 },
        { rank: 14, team: "USA", rating: 44 },
        { rank: 15, team: "Netherlands", rating: 40 },
        { rank: 16, team: "Oman", rating: 35 },
        { rank: 17, team: "Nepal", rating: 27 },
        { rank: 18, team: "Namibia", rating: 21 },
        { rank: 19, team: "Canada", rating: 16 },
        { rank: 20, team: "UAE", rating: 11 }
    ]};

    const men_t20_team = { category: 'men_t20_team', players: [
        { rank: 1, team: "India", rating: 272 },
        { rank: 2, team: "Australia", rating: 267 },
        { rank: 3, team: "England", rating: 258 },
        { rank: 4, team: "New Zealand", rating: 251 },
        { rank: 5, team: "South Africa", rating: 240 },
        { rank: 6, team: "West Indies", rating: 236 },
        { rank: 7, team: "Pakistan", rating: 235 },
        { rank: 8, team: "Sri Lanka", rating: 228 },
        { rank: 9, team: "Bangladesh", rating: 223 },
        { rank: 10, team: "Afghanistan", rating: 220 },
        { rank: 11, team: "Ireland", rating: 201 },
        { rank: 12, team: "Zimbabwe", rating: 200 },
        { rank: 13, team: "Netherlands", rating: 182 },
        { rank: 14, team: "Scotland", rating: 182 },
        { rank: 15, team: "Namibia", rating: 181 },
        { rank: 16, team: "United Arab Emirates", rating: 176 },
        { rank: 17, team: "Nepal", rating: 176 },
        { rank: 18, team: "USA", rating: 175 },
        { rank: 19, team: "Canada", rating: 154 },
        { rank: 20, team: "Oman", rating: 152 }
    ]};

    const categories = [
      men_test_batting, men_odi_batting, men_t20_batting,
      men_test_bowling, men_odi_bowling, men_t20_bowling,
      men_test_allrounder, men_odi_allrounder, men_t20_allrounder,
      men_test_team, men_odi_team, men_t20_team
    ];

    for (const cat of categories) {
      await Ranking.findOneAndUpdate({ category: cat.category }, cat, { upsert: true });
    }

    console.log('Rankings Seeded Successfully!');
    process.exit();
  })
  .catch(err => console.error(err));
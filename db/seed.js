const pool = require('./connection');

async function seedDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Create tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(50) NOT NULL UNIQUE,
        location VARCHAR(200),
        state VARCHAR(50),
        area_hectares NUMERIC(10,2),
        start_date DATE,
        status VARCHAR(50) DEFAULT 'Active',
        project_type VARCHAR(100),
        total_budget NUMERIC(15,2),
        budget_utilized NUMERIC(15,2),
        total_farmers INTEGER,
        trees_planted INTEGER,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS carbon_credits (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        year INTEGER NOT NULL,
        anticipated_er NUMERIC(10,2),
        actual_issued NUMERIC(10,2),
        retired NUMERIC(10,2),
        wip NUMERIC(10,2),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS finance (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        financial_year VARCHAR(20),
        category VARCHAR(100),
        budget_amount NUMERIC(15,2),
        actual_amount NUMERIC(15,2),
        variance NUMERIC(15,2),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS procurement (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        rfq_number VARCHAR(100),
        vendor_name VARCHAR(200),
        item_description TEXT,
        rfq_amount NUMERIC(15,2),
        po_amount NUMERIC(15,2),
        po_date DATE,
        status VARCHAR(50),
        payment_status VARCHAR(50),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        designation VARCHAR(200),
        department VARCHAR(100),
        email VARCHAR(200),
        phone VARCHAR(20),
        project_assignment VARCHAR(200),
        reporting_to VARCHAR(200),
        joined_date DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS monitoring_data (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id),
        monitoring_date DATE,
        monitoring_type VARCHAR(100),
        survival_rate NUMERIC(5,2),
        trees_surveyed INTEGER,
        trees_survived INTEGER,
        remarks TEXT,
        submitted_by VARCHAR(200),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Seed Projects
    const projectsCheck = await client.query('SELECT COUNT(*) FROM projects');
    if (parseInt(projectsCheck.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO projects (name, code, location, state, area_hectares, start_date, status, project_type, total_budget, budget_utilized, total_farmers, trees_planted, description) VALUES
        ('Shristi', 'PRJ-SHRISTI', 'Dumka, Jharkhand', 'Jharkhand', 2450.50, '2021-04-01', 'Active', 'Afforestation & Reforestation', 18500000, 12300000, 342, 485000, 'Large-scale afforestation project covering tribal lands in Dumka district with community participation.'),
        ('Rangsang', 'PRJ-RANGSANG', 'Deoghar, Jharkhand', 'Jharkhand', 1820.75, '2022-01-15', 'Active', 'Agroforestry', 14200000, 8900000, 218, 320000, 'Agroforestry initiative integrating carbon sequestration with farmer livelihoods in Deoghar.'),
        ('Prasari', 'PRJ-PRASARI', 'Pakur, Jharkhand', 'Jharkhand', 3100.00, '2020-10-01', 'Active', 'Natural Regeneration', 22000000, 16500000, 512, 680000, 'Natural forest regeneration project preserving existing biodiversity and expanding tree cover.'),
        ('Soova', 'PRJ-SOOVA', 'Godda, Jharkhand', 'Jharkhand', 1560.25, '2023-03-01', 'Active', 'Plantation', 11800000, 4200000, 189, 210000, 'New plantation project focused on farmer onboarding and maintenance cycles in Godda district.');
      `);

      // Seed Carbon Credits
      await client.query(`
        INSERT INTO carbon_credits (project_id, year, anticipated_er, actual_issued, retired, wip, status) VALUES
        (1, 2021, 12000, 0, 0, 0, 'Baseline'),
        (1, 2022, 15000, 11200, 3500, 7700, 'Issued'),
        (1, 2023, 18500, 16800, 5200, 11600, 'Issued'),
        (1, 2024, 22000, 19500, 7800, 11700, 'Issued'),
        (1, 2025, 25000, 0, 0, 25000, 'WIP'),
        (2, 2022, 8000, 0, 0, 0, 'Baseline'),
        (2, 2023, 10500, 9200, 2800, 6400, 'Issued'),
        (2, 2024, 13000, 11800, 4200, 7600, 'Issued'),
        (2, 2025, 16000, 0, 0, 16000, 'WIP'),
        (3, 2020, 18000, 0, 0, 0, 'Baseline'),
        (3, 2021, 22000, 18500, 6200, 12300, 'Issued'),
        (3, 2022, 28000, 25600, 9800, 15800, 'Issued'),
        (3, 2023, 32000, 29800, 12500, 17300, 'Issued'),
        (3, 2024, 36000, 33200, 15000, 18200, 'Issued'),
        (3, 2025, 40000, 0, 0, 40000, 'WIP'),
        (4, 2023, 5000, 0, 0, 0, 'Baseline'),
        (4, 2024, 7500, 4800, 1200, 3600, 'Issued'),
        (4, 2025, 10000, 0, 0, 10000, 'WIP');
      `);

      // Seed Finance
      await client.query(`
        INSERT INTO finance (project_id, financial_year, category, budget_amount, actual_amount, variance, status) VALUES
        (1, 'FY 2023-24', 'Plantation Activities', 4500000, 4200000, 300000, 'Under Budget'),
        (1, 'FY 2023-24', 'Monitoring & Evaluation', 1200000, 1150000, 50000, 'Under Budget'),
        (1, 'FY 2023-24', 'HR & Administration', 2800000, 2950000, -150000, 'Over Budget'),
        (1, 'FY 2023-24', 'CAD & GIS', 800000, 780000, 20000, 'Under Budget'),
        (2, 'FY 2023-24', 'Plantation Activities', 3200000, 2980000, 220000, 'Under Budget'),
        (2, 'FY 2023-24', 'Monitoring & Evaluation', 980000, 1020000, -40000, 'Over Budget'),
        (3, 'FY 2023-24', 'Plantation Activities', 5800000, 5650000, 150000, 'Under Budget'),
        (3, 'FY 2023-24', 'Monitoring & Evaluation', 1800000, 1750000, 50000, 'Under Budget'),
        (4, 'FY 2023-24', 'Plantation Activities', 2800000, 1900000, 900000, 'Under Budget'),
        (4, 'FY 2023-24', 'Monitoring & Evaluation', 600000, 480000, 120000, 'Under Budget');
      `);

      // Seed Procurement
      await client.query(`
        INSERT INTO procurement (project_id, rfq_number, vendor_name, item_description, rfq_amount, po_amount, po_date, status, payment_status) VALUES
        (1, 'RFQ-SHR-2024-001', 'Green Earth Nurseries Pvt Ltd', 'Saplings supply - Mixed native species (50,000 units)', 850000, 820000, '2024-03-15', 'PO Issued', 'Paid'),
        (1, 'RFQ-SHR-2024-002', 'Tribal Cooperative Society', 'Labor for plantation activities - Q1 2024', 420000, 420000, '2024-04-01', 'PO Issued', 'Paid'),
        (2, 'RFQ-RAN-2024-001', 'Agroforest Solutions Ltd', 'Soil testing and analysis services', 180000, 175000, '2024-02-20', 'PO Issued', 'Paid'),
        (3, 'RFQ-PRA-2024-001', 'Remote Sensing Corp', 'Drone survey and GIS mapping services', 650000, 640000, '2024-01-10', 'PO Issued', 'Partially Paid'),
        (3, 'RFQ-PRA-2024-002', 'Forest Guard Services', 'Security and monitoring staff for Q1 2024', 320000, 320000, '2024-03-01', 'PO Issued', 'Paid'),
        (4, 'RFQ-SOO-2024-001', 'Godda Nursery Association', 'Saplings supply - Teak and mixed species (25,000 units)', 480000, 465000, '2024-04-15', 'CS Approved', 'Pending'),
        (1, 'RFQ-SHR-2024-003', 'Arcadis India Pvt Ltd', 'Annual MRV verification services', 1200000, null, null, 'RFQ Sent', 'Not Applicable'),
        (2, 'RFQ-RAN-2024-002', 'BioCarbon Registry', 'Carbon credit issuance & registration fees', 350000, null, null, 'Vendor Evaluation', 'Not Applicable');
      `);

      // Seed Team
      await client.query(`
        INSERT INTO team_members (name, designation, department, email, project_assignment, reporting_to) VALUES
        ('Rajesh Kumar Sharma', 'Associate Director NBS', 'Nature Based Solutions', 'rajesh.sharma@fcf.in', 'All Projects', 'CEO'),
        ('Priya Agarwal', 'Associate Director Strategy & Growth', 'Strategy', 'priya.agarwal@fcf.in', 'All Projects', 'CEO'),
        ('Anand Mishra', 'Project Manager', 'Project Management', 'anand.mishra@fcf.in', 'Shristi', 'Rajesh Kumar Sharma'),
        ('Sunita Devi', 'Project Manager', 'Project Management', 'sunita.devi@fcf.in', 'Prasari', 'Rajesh Kumar Sharma'),
        ('Mohammad Aslam', 'Project Manager', 'Project Management', 'm.aslam@fcf.in', 'Rangsang', 'Rajesh Kumar Sharma'),
        ('Kavita Singh', 'Project Manager', 'Project Management', 'kavita.singh@fcf.in', 'Soova', 'Rajesh Kumar Sharma'),
        ('Dr. Ramesh Pandey', 'GIS & Remote Sensing Specialist', 'GIS', 'ramesh.pandey@fcf.in', 'All Projects', 'Rajesh Kumar Sharma'),
        ('Neha Verma', 'Agri Expert', 'Agriculture', 'neha.verma@fcf.in', 'All Projects', 'Rajesh Kumar Sharma'),
        ('Sanjay Yadav', 'Agri Associate', 'Agriculture', 'sanjay.yadav@fcf.in', 'Shristi, Prasari', 'Neha Verma'),
        ('Vikram Jha', 'Monitoring Expert', 'M&E', 'vikram.jha@fcf.in', 'All Projects', 'Rajesh Kumar Sharma'),
        ('Amit Gupta', 'Finance Manager', 'Finance', 'amit.gupta@fcf.in', 'All Projects', 'Priya Agarwal'),
        ('Rekha Sinha', 'Head of Accounts', 'Finance', 'rekha.sinha@fcf.in', 'All Projects', 'Amit Gupta'),
        ('Deepak Tiwari', 'Accounts Associate', 'Finance', 'deepak.tiwari@fcf.in', 'All Projects', 'Rekha Sinha'),
        ('Meera Kumari', 'HR & Admin Director', 'HR', 'meera.kumari@fcf.in', 'All Projects', 'CEO'),
        ('Suresh Patel', 'HR Head', 'HR', 'suresh.patel@fcf.in', 'All Projects', 'Meera Kumari'),
        ('Anita Roy', 'Head of Investments', 'Finance', 'anita.roy@fcf.in', 'All Projects', 'CEO'),
        ('Prakash Nath', 'M&E Manager', 'M&E', 'prakash.nath@fcf.in', 'All Projects', 'Vikram Jha'),
        ('Divya Tiwari', 'Communication Associate', 'Strategy', 'divya.tiwari@fcf.in', 'All Projects', 'Priya Agarwal'),
        ('Dr. Sunil Mehta', 'Manager Environment & Climate', 'Environment', 'sunil.mehta@fcf.in', 'All Projects', 'Rajesh Kumar Sharma');
      `);

      // Seed Monitoring
      await client.query(`
        INSERT INTO monitoring_data (project_id, monitoring_date, monitoring_type, survival_rate, trees_surveyed, trees_survived, remarks, submitted_by) VALUES
        (1, '2024-01-15', 'Periodic Monitoring', 87.5, 5000, 4375, 'Good survival rate in upper plateau zones', 'Vikram Jha'),
        (1, '2024-04-10', 'Periodic Monitoring', 89.2, 5000, 4460, 'Post-monsoon survival improved significantly', 'Vikram Jha'),
        (1, '2024-10-05', 'Annual MRV Survey', 91.0, 10000, 9100, 'Annual verification survey completed successfully', 'Arcadis'),
        (2, '2024-02-20', 'Periodic Monitoring', 82.3, 3000, 2469, 'Some mortality in rocky terrain areas', 'Prakash Nath'),
        (2, '2024-08-18', 'Periodic Monitoring', 85.7, 3000, 2571, 'Improved after corrective planting', 'Prakash Nath'),
        (3, '2024-01-08', 'Periodic Monitoring', 93.4, 8000, 7472, 'Excellent performance in natural regeneration zones', 'Vikram Jha'),
        (3, '2024-07-22', 'Annual MRV Survey', 94.1, 15000, 14115, 'Best performance project - issuance recommended', 'Aswatha MRV'),
        (4, '2024-06-12', 'Periodic Monitoring', 78.9, 2000, 1578, 'New plantation - growth within expected range', 'Sanjay Yadav');
      `);
    }

    await client.query('COMMIT');
    console.log('✅ Database seeded successfully');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Seed error:', err.message);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = seedDatabase;

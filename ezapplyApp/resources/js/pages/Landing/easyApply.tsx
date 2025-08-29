import React, { useState } from 'react';
import '../../../css/easyApply.css';
import { Link } from '@inertiajs/react';

const companies = [
  {
    id: 1,
    name: 'Krispy King',
    type: 'Food',
    companyName: 'Krispy King',
    brandName: 'Krispy King',
    yearFounded: 2010,
    headquarters: 'Quezon City, Philippines',
    franchiseType: 'Food',
    minimumInvestment: '₱1,200,000 (~$21,000 USD)',
    numberOfBranches: 150,
    description: 'Krispy King is a beloved fast-food chain specializing in crispy fried chicken and savory rice meals. Known for its affordable prices and bold flavors, Krispy King offers franchisees a proven business model with comprehensive training and marketing support to thrive in the competitive food industry.'
  },
  {
    id: 2,
    name: 'Jollibee',
    type: 'Food',
    companyName: 'Jollibee Foods',
    brandName: 'Jollibee',
    yearFounded: 1978,
    headquarters: 'Pasig City, Philippines',
    franchiseType: 'Food',
    minimumInvestment: '₱35,000,000 (~$620,000 USD)',
    numberOfBranches: 1500,
    description: 'Jollibee is a global Filipino fast-food icon, famous for its Chickenjoy, Jolly Spaghetti, and unique burgers. With a strong international presence and a loyal customer base, Jollibee provides franchisees with extensive operational support and a globally recognized brand.'
  },
  {
    id: 3,
    name: 'Pickup Coffee',
    type: 'Cafe',
    companyName: 'Pickup Coffee Co.',
    brandName: 'Pickup Coffee',
    yearFounded: 2020,
    headquarters: 'Makati City, Philippines',
    franchiseType: 'Cafe',
    minimumInvestment: '₱2,500,000 (~$44,000 USD)',
    numberOfBranches: 50,
    description: 'Pickup Coffee is a trendy cafe chain offering affordable, high-quality coffee and pastries in a modern setting. Targeting young professionals and students, Pickup Coffee provides franchisees with a scalable model and support for creating vibrant community spaces.'
  },
  {
    id: 4,
    name: 'Mr. Lemon',
    type: 'Drinks',
    companyName: 'Mr. Lemon Enterprises',
    brandName: 'Mr. Lemon',
    yearFounded: 2018,
    headquarters: 'Cebu City, Philippines',
    franchiseType: 'Drinks',
    minimumInvestment: '₱800,000 (~$14,000 USD)',
    numberOfBranches: 80,
    description: 'Mr. Lemon specializes in refreshing lemon-based beverages and fruit drinks, perfect for tropical climates. With a focus on fresh ingredients and innovative flavors, Mr. Lemon offers franchisees a low-cost entry into the booming beverage market with robust training support.'
  },
  {
    id: 5,
    name: 'Angel`s Burger',
    type: 'Food',
    companyName: 'Angel’s Burger Inc.',
    brandName: 'Angel’s Burger',
    yearFounded: 1997,
    headquarters: 'Manila, Philippines',
    franchiseType: 'Food',
    minimumInvestment: '₱500,000 (~$9,000 USD)',
    numberOfBranches: 2000,
    description: 'Angel’s Burger is a popular street-food chain known for its affordable buy-one-take-one burgers and quick service. Ideal for high-traffic locations, Angel’s Burger equips franchisees with a simple, high-demand business model and operational guidance.'
  },
  {
    id: 6,
    name: 'Mang Inasal',
    type: 'Food',
    companyName: 'Mang Inasal Philippines, Inc.',
    brandName: 'Mang Inasal',
    yearFounded: 2003,
    headquarters: 'Iloilo City, Philippines',
    franchiseType: 'Food',
    minimumInvestment: '₱15,000,000 (~$265,000 USD)',
    numberOfBranches: 700,
    description: 'Mang Inasal is a leading Filipino fast-food chain specializing in grilled chicken (inasal) and unlimited rice. With a strong cultural appeal and nationwide presence, Mang Inasal offers franchisees a profitable opportunity backed by extensive marketing and operational support.'
  }
];

export default function EasyApplyLanding({ user }: { user?: any }) {
  const [search, setSearch] = useState('');
  const [checked, setChecked] = useState<number[]>([]);
  const [filter, setFilter] = useState('all');
  const [type, setType] = useState('all');

  const isVerified = !!user && typeof user === 'object' && Object.keys(user).length > 0;

  let filtered = companies;
  if (filter === 'type' && type !== 'all') {
    filtered = filtered.filter(c => c.type === type);
  }
  filtered = filtered.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleCheck = (id: number) => {
    setChecked(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div>
      <nav className="ezapply-nav">
        <div className="ezapply-logo">EZApply</div>
        <div className="ezapply-navlinks">
          <div className="ezapply-navlink">Home</div>
          <div className="ezapply-navlink">Services</div>
          <div className="ezapply-navlink">About</div>
          <div className="ezapply-navlink">Contact</div>
        </div>
        <div className="ezapply-login-container">
          {!isVerified ? (
            <Link
              href="/login"
              className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
            >
              Login
            </Link>
          ): (
            <Link
             href="/dashboard"
              className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
              >
                Dashboard
              </Link>
            )}
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '5rem' }}>
        <div style={{ width: '100%', maxWidth: 480, marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search companies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 8, border: '1px solid #ddd', fontSize: '1rem' }}
          />
          <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #2563eb', fontWeight: 500 }}>
            <option value="all">All Companies</option>
            <option value="type">By Type</option>
          </select>
          {filter === 'type' && (
            <select value={type} onChange={e => setType(e.target.value)} style={{ padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid #2563eb', fontWeight: 500 }}>
              <option value="all">All Types</option>
              <option value="Food">Food</option>
              <option value="Cafe">Cafe</option>
              <option value="Drinks">Drinks</option>
            </select>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', width: '100%', padding: '0 5rem' }}>
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1/3', textAlign: 'center', color: '#888', padding: '2rem' }}>No companies found.</div>
          ) : (
            filtered.map((company) => (
              <div key={company.id} style={{ width: '100%', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #eee', padding: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <input
                    type="checkbox"
                    checked={checked.includes(company.id)}
                    onChange={() => handleCheck(company.id)}
                    style={{ marginRight: '1rem', accentColor: '#074035' }}
                  />
                  <img
                    src={'/favicon.svg'}
                    alt={company.companyName + ' logo'}
                    style={{ height: '32px', width: '32px', marginRight: '0.5rem', borderRadius: '6px', objectFit: 'cover' }}
                  />
                  <span style={{ fontWeight: 600, fontSize: '1.2rem', color: '#1b1b18' }}> {company.companyName}</span>
                </div>
                <div style={{ fontSize: '0.9rem', color: '#000000ff', lineHeight: '1.5' }}>
                  <p><strong>Brand:</strong> {company.brandName}</p>
                  <p><strong>Founded:</strong> {company.yearFounded}</p>
                  <p><strong>Headquarters:</strong> {company.headquarters}</p>
                  <p><strong>Type:</strong> {company.franchiseType}</p>
                  <p><strong>Investment:</strong> {company.minimumInvestment}</p>
                  <p><strong>Branches:</strong> {company.numberOfBranches}</p>
                  <p><strong>Description:</strong> {company.description}</p>
                </div>
              </div>
            ))
          )}
        </div>
        <button
          type="button"
          className="ezapply-submit-btn mb-5"
          disabled={checked.length === 0}
          onClick={() => alert(`Selected company IDs: ${checked.join(', ')}`)}
        >
          Submit Selected
        </button>
      </main>
    </div>
  );
}
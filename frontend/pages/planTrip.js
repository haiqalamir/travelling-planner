// pages/planTrip.js
import { useState, useEffect } from 'react';
import axios from 'axios';
import Head from 'next/head';
import Link from 'next/link';
import { DatePicker, Select, Button, message } from 'antd';
import moment from 'moment';
import { useRouter } from 'next/router';

const { Option } = Select;

// Full list of countries
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi",
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
  "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", 
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", 
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", 
  "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", 
  "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", 
  "Micronesia", "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", 
  "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", 
  "Oman", "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", 
  "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", 
  "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", 
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", 
  "South Africa", "South Korea", "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", 
  "Syria", "Tajikistan", "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", 
  "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", 
  "United States of America", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Comprehensive list of languages
const languages = [
  "Afrikaans", "Albanian", "Amharic", "Arabic", "Armenian", "Azerbaijani", "Basque", "Belarusian", "Bengali",
  "Bosnian", "Bulgarian", "Catalan", "Cebuano", "Chichewa", "Chinese (Simplified)", "Chinese (Traditional)",
  "Corsican", "Croatian", "Czech", "Danish", "Dutch", "English", "Esperanto", "Estonian", "Filipino", "Finnish",
  "French", "Frisian", "Galician", "Georgian", "German", "Greek", "Gujarati", "Haitian Creole", "Hausa", "Hawaiian",
  "Hebrew", "Hindi", "Hmong", "Hungarian", "Icelandic", "Igbo", "Indonesian", "Irish", "Italian", "Japanese", 
  "Javanese", "Kannada", "Kazakh", "Khmer", "Kinyarwanda", "Korean", "Kurdish", "Kyrgyz", "Lao", "Latin", "Latvian",
  "Lithuanian", "Luxembourgish", "Macedonian", "Malagasy", "Malay", "Malayalam", "Maltese", "Maori", "Marathi",
  "Mongolian", "Myanmar (Burmese)", "Nepali", "Norwegian", "Odia", "Pashto", "Persian", "Polish", "Portuguese",
  "Punjabi", "Romanian", "Russian", "Samoan", "Scottish Gaelic", "Serbian", "Sesotho", "Shona", "Sindhi", "Sinhala",
  "Slovak", "Slovenian", "Somali", "Spanish", "Sundanese", "Swahili", "Swedish", "Tajik", "Tamil", "Tatar", "Telugu",
  "Thai", "Turkish", "Turkmen", "Ukrainian", "Urdu", "Uzbek", "Vietnamese", "Welsh", "Xhosa", "Yiddish", "Yoruba", "Zulu"
];

// Add‑on services
const SERVICE_OPTIONS = [
  { key: 'Accommodation',  label: 'Accommodation: hotel stay (base RM150)' },
  { key: 'Transport',      label: 'Transport: airport & local (base RM50)' },
  { key: 'Entertainment',  label: 'Entertainment: tours & events (base RM100)' },
  { key: 'Meals',          label: 'Meals: full meal plan (base RM60)' },
  { key: 'Insurance',      label: 'Insurance: travel coverage (base RM30)' },
  { key: 'Misc',           label: 'Misc: fees, taxes, tips (base RM25)' },
];

export default function PlanTrip() {
  const [formData, setFormData] = useState({
    customerId: '',           // filled from session
    travelDateTime: '',
    country: '',
    languageSpoken: '',
    numberOfTravelers: 1,
    languageSuitability: false,
  });
  const [selectedServices, setSelectedServices] = useState([]);
  const router = useRouter();

  // On mount: check login & set customerId
  useEffect(() => {
    const session = localStorage.getItem('user');
    if (!session) {
      router.push('/login');
    } else {
      const { customerId } = JSON.parse(session);
      setFormData(f => ({ ...f, customerId }));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCountryChange = v => {
    setFormData(f => ({ ...f, country: v }));
  };

  const handleLanguageChange = v => {
    setFormData(f => ({ ...f, languageSpoken: v }));
  };

  const handleDateChange = (_d, ds) => {
    setFormData(f => ({ ...f, travelDateTime: ds }));
  };

  const toggleService = key => {
    setSelectedServices(s =>
      s.includes(key)
        ? s.filter(x => x !== key)
        : [...s, key]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/api/holidayPlanner', {
        ...formData,
        selectedServices
      });
      message.success('Trip planned successfully!', 3);
      setTimeout(() => router.reload(), 3000);
    } catch (err) {
      console.error(err);
      message.error(err.response?.data?.error || 'Error planning trip', 3);
    }
  };

  return (
    <>
      <Head>
        <title>Plan Your Trip - Travel Planner</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="container">
        <header className="site-header">
          <div className="logo">
            <h1>Plan Your Trip</h1>
          </div>
          <nav className="site-nav">
            <Link href="/"><a>Home</a></Link>
            <Link href="/viewPlans"><a>My Trips</a></Link>
            <Link href="/invoice"><a>Invoice</a></Link>
            <Button type="danger" onClick={handleLogout}>Logout</Button>
          </nav>
        </header>

        <section className="content-section">
          <div className="card form-card">
            <h2>Trip Details</h2>
            <form onSubmit={handleSubmit} className="trip-form">
              {/* Travel Date & Time */}
              <div className="form-group">
                <label htmlFor="travelDateTime">Travel Date and Time:</label>
                <DatePicker
                  id="travelDateTime"
                  showTime={{ format: 'hh:mm A', use12Hours: true }}
                  format="DD/MM/YYYY hh:mm A"
                  onChange={handleDateChange}
                  style={{ width: "100%" }}
                  placeholder="Select travel date and time"
                  required
                />
              </div>

              {/* Country */}
              <div className="form-group">
                <label htmlFor="country">Country:</label>
                <Select
                  showSearch
                  placeholder="Select a country"
                  optionFilterProp="children"
                  value={formData.country || undefined}
                  onChange={handleCountryChange}
                  filterOption={(input, option) =>
                    option?.props?.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                  required
                >
                  {countries.map(country => (
                    <Option key={country} value={country}>
                      {country}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Language */}
              <div className="form-group">
                <label htmlFor="languageSpoken">Language Spoken:</label>
                <Select
                  showSearch
                  placeholder="Select a language"
                  optionFilterProp="children"
                  value={formData.languageSpoken || undefined}
                  onChange={handleLanguageChange}
                  filterOption={(input, option) =>
                    option?.props?.children.toLowerCase().includes(input.toLowerCase())
                  }
                  style={{ width: "100%" }}
                  required
                >
                  {languages.map(lang => (
                    <Option key={lang} value={lang}>
                      {lang}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Number of Travelers */}
              <div className="form-group">
                <label htmlFor="numberOfTravelers">Number of Travelers:</label>
                <input
                  type="number"
                  id="numberOfTravelers"
                  name="numberOfTravelers"
                  value={formData.numberOfTravelers}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              {/* Language Suitability */}
              <div className="form-group checkbox-group">
                <label htmlFor="languageSuitability">Know local language?</label>
                <input
                  type="checkbox"
                  id="languageSuitability"
                  name="languageSuitability"
                  checked={formData.languageSuitability}
                  onChange={handleChange}
                />
              </div>

              {/* Additional Services */}
              <div className="form-group">
                <label>Additional Services:</label>
                {SERVICE_OPTIONS.map(svc => (
                  <div key={svc.key} className="checkbox-group">
                    <input
                      type="checkbox"
                      id={svc.key}
                      name="selectedServices"
                      value={svc.key}
                      checked={selectedServices.includes(svc.key)}
                      onChange={() => toggleService(svc.key)}
                    />
                    <label htmlFor={svc.key}>{svc.label}</label>
                  </div>
                ))}
              </div>

              <button type="submit" className="btn primary-btn">
                Plan Trip
              </button>
            </form>
          </div>
        </section>

        <footer className="site-footer">
          <p>&copy; {new Date().getFullYear()} Travel Planner</p>
        </footer>
      </div>
    </>
  );
}

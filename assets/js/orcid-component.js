const { defineCustomElement, ref, onMounted } = Vue;

const ResearchPapersComponent = {
  props: {
    orcid: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const papers = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchPapers = async () => {
      try {
        loading.value = true;
        error.value = null;
        
        const orcidUrl = `https://pub.orcid.org/v3.0/${props.orcid}/works`;
        const response = await fetch(orcidUrl, {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.group && Array.isArray(data.group)) {
          papers.value = data.group.map(group => {
            const workSummary = group['work-summary']?.[0];
            if (!workSummary) return null;
            
            const externalIds = workSummary['external-ids']?.['external-id'] || [];
            const doi = externalIds.find(id => id['external-id-type'] === 'doi');
            const url = doi?.['external-id-url']?.value || '';
            
            return {
              title: workSummary.title?.title?.value || 'Untitled',
              year: workSummary['publication-date']?.year?.value || 'N/A',
              month: workSummary['publication-date']?.month?.value || null,
              type: workSummary.type || 'Unknown',
              journal: workSummary['journal-title']?.value || '',
              url: url,
              putCode: workSummary['put-code']
            };
          }).filter(paper => paper !== null)
            .sort((a, b) => {
              if (b.year !== a.year) return (b.year || 0) - (a.year || 0);
              return (b.month || 0) - (a.month || 0);
            });
        }
      } catch (e) {
        error.value = `Unable to fetch publications: ${e.message}`;
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchPapers();
    });

    return { papers, loading, error };
  },
  styles: [`
    :host {
      --primary-color: #667eea;
      --secondary-color: #e8eaf6;
      --text-color: #2c3e50;
      --text-light: #7f8c8d;
      --bg-light: #f8f9fa;
      --border-color: #e0e0e0;
      --border-radius: 8px;
      --card-padding: 20px;
      --hover-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
      display: block;
      font-family: inherit;
    }
    .loading-container {
      text-align: center;
      padding: 40px;
      color: var(--primary-color);
    }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid var(--primary-color);
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .error-container {
      background: #fee;
      border-left: 4px solid #e74c3c;
      padding: var(--card-padding);
      border-radius: var(--border-radius);
      color: #c0392b;
    }
    .empty-container {
      text-align: center;
      padding: 40px;
      color: #95a5a6;
    }
    .header {
      margin-bottom: 20px;
      padding: 15px;
      background: var(--bg-light);
      border-radius: var(--border-radius);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }
    .count {
      color: var(--primary-color);
      font-weight: bold;
    }
    .orcid-id {
      color: var(--text-light);
      font-size: 14px;
    }
    .paper-card {
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      padding: var(--card-padding);
      margin-bottom: 15px;
      transition: all 0.3s ease;
      background: white;
    }
    .paper-card:hover {
      box-shadow: var(--hover-shadow);
      border-color: var(--primary-color);
    }
    .badges {
      display: flex;
      gap: 10px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }
    .badge-year {
      background: var(--primary-color);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .badge-type {
      background: var(--secondary-color);
      color: var(--primary-color);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      text-transform: capitalize;
    }
    .paper-title {
      margin: 10px 0;
      color: var(--text-color);
      font-size: 18px;
      line-height: 1.4;
      font-weight: 600;
    }
    .paper-journal {
      color: var(--text-light);
      font-style: italic;
      margin: 8px 0;
      font-size: 14px;
    }
    .paper-link {
      display: inline-block;
      margin-top: 10px;
      color: var(--primary-color);
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
    }
    .paper-link:hover {
      text-decoration: underline;
    }
  `],
  template: `
    <div>
      <div v-if="loading" class="loading-container">
        <div class="spinner"></div>
        <p>Loading publications from ORCID...</p>
      </div>
      <div v-else-if="error" class="error-container">
        <strong>⚠️ Error:</strong> {{ error }}
      </div>
      <div v-else-if="papers.length === 0" class="empty-container">
        <p>No publications found.</p>
      </div>
      <div v-else>
        <div class="header">
          <span class="count">
            📚 {{ papers.length }} publication{{ papers.length !== 1 ? 's' : '' }} found
          </span>
          <span class="orcid-id">ORCID: {{ orcid }}</span>
        </div>
        <div v-for="(paper, index) in papers" :key="paper.putCode || index" 
             class="paper-card" part="paper-card">
          <div class="badges">
            <span class="badge-year" part="badge-year">{{ paper.year }}</span>
            <span class="badge-type" part="badge-type">{{ paper.type.replace(/-/g, ' ') }}</span>
          </div>
          <h3 class="paper-title" part="paper-title">{{ paper.title }}</h3>
          <p v-if="paper.journal" class="paper-journal" part="paper-journal">
            📖 {{ paper.journal }}
          </p>
          <a v-if="paper.url" :href="paper.url" target="_blank" 
             rel="noopener noreferrer" class="paper-link" part="paper-link">
            View publication →
          </a>
        </div>
      </div>
    </div>
  `
};

const ResearchPapers = defineCustomElement(ResearchPapersComponent);
customElements.define('research-papers', ResearchPapers);
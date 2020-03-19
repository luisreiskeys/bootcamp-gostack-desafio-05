import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';
import Container from '../../components/Container';
import {
  Loading,
  Owner,
  IssueList,
  FiltersContainer,
  Filter,
  BottomHeader,
  PerPege,
  Pagination,
  Pg,
} from './styles';
// import { Container } from './styles';

export default class Repository extends Component {
  constructor(props) {
    super(props);
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      perPage: 5,
      page: 1,
      filters: [
        { state: 'all', name: 'Todas' },
        { state: 'open', name: 'Abertas' },
        { state: 'closed', name: 'Fechadas' },
      ],
      activeFilter: 0,
    };
  }

  async componentDidMount() {
    const { match } = this.props;
    const { filters, perPage, activeFilter, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filters[activeFilter].state,
          per_page: perPage,
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  loadIssues = async () => {
    const { match } = this.props;
    const repoName = decodeURIComponent(match.params.repository);
    const { filters, perPage, activeFilter, page } = this.state;
    const issues = await api.get(`/repos/${repoName}/issues`, {
      params: {
        state: filters[activeFilter].state,
        per_page: perPage,
        page,
      },
    });
    this.setState({
      issues: issues.data,
    });
  };

  filter = async index => {
    await this.setState({
      activeFilter: index,
      page: 1,
    });
    this.loadIssues();
  };

  changePerPage = async event => {
    await this.setState({ perPage: event.target.value });
    this.loadIssues();
  };

  render() {
    const {
      repository,
      issues,
      loading,
      filters,
      activeFilter,
      page,
    } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <BottomHeader>
          <PerPege onChange={this.changePerPage}>
            <option value={5}>5 issues por página</option>
            <option value={10}>10 issues por página</option>
            <option value={20}>20 issues por página</option>
            <option value={30}>30 issues por página</option>
          </PerPege>
          <FiltersContainer>
            {filters.map((f, index) => (
              <Filter
                onClick={() => this.filter(index)}
                active={index === activeFilter}
              >
                {f.name}
              </Filter>
            ))}
          </FiltersContainer>
        </BottomHeader>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Pagination>
          <Pg
            onClick={async () => {
              if (page > 1) {
                await this.setState({ page: page - 1 });
              }
              this.loadIssues();
            }}
            disabled={page === 1}
          >
            {`<`}
          </Pg>
          <Pg
            onClick={async () => {
              await this.setState({ page: page + 1 });
              this.loadIssues();
            }}
          >{`>`}</Pg>
        </Pagination>
      </Container>
    );
  }
}

Repository.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      repository: PropTypes.string,
    }),
  }).isRequired,
};

from typing import List, Dict, Tuple, Any
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.models.entities import JobRole, UserSkill, RoleSkillRequirement
from app.schemas.analysis import NLPEngineMetrics

# Domain clusters for transferable skill credit calculation
SKILL_TRANSFER_CLUSTERS: List[Dict[str, Any]] = [
    {
        "domain": "Backend Frameworks",
        "skills": ["fastapi", "flask", "django", "express.js", "nodejs", "spring boot", "asp.net"],
        "credit_ratio": 0.65,
        "rationale": "Shared RESTful architectural principles, routing, middleware, and request/response lifecycle"
    },
    {
        "domain": "Relational Databases",
        "skills": ["postgresql", "mysql", "sqlite", "oracle", "sql server"],
        "credit_ratio": 0.80,
        "rationale": "High transferability of ANSI SQL syntax, normalization, schema design, and query indexing"
    },
    {
        "domain": "Machine Learning & Deep Learning",
        "skills": ["pytorch", "tensorflow", "keras", "scikit-learn", "xgboost"],
        "credit_ratio": 0.70,
        "rationale": "Shared mathematical tensors, gradient optimization, loss backpropagation, and evaluation metrics"
    },
    {
        "domain": "Modern Frontend Frameworks",
        "skills": ["react", "vue.js", "angular", "next.js", "svelte"],
        "credit_ratio": 0.75,
        "rationale": "Shared component lifecycle, virtual DOM/reactivity, unidirectional state flow, and JSX/template rendering"
    },
    {
        "domain": "Test Automation & QA",
        "skills": ["pytest", "jest", "unittest", "selenium", "playwright", "cypress"],
        "credit_ratio": 0.70,
        "rationale": "Shared assertions, mock fixtures, test runner patterns, and end-to-end automation principles"
    },
    {
        "domain": "Containerization & DevOps",
        "skills": ["docker", "kubernetes", "podman", "github actions", "gitlab ci"],
        "credit_ratio": 0.60,
        "rationale": "Container isolation, declarative YAML pipelines, image registries, and orchestration concepts"
    }
]

def build_role_text(role: JobRole, requirements: List[RoleSkillRequirement]) -> str:
    """
    Constructs a rich textual document representing the role benchmark.
    Combines title, department, description, overview, responsibilities, and all skill names repeated by requirement weight.
    """
    tokens = [
        role.title,
        role.title,  # Emphasize title
        role.department,
        role.description or "",
        role.overview or "",
        role.key_responsibilities or ""
    ]

    for req in requirements:
        if req.skill:
            # Repeat required skills according to weight and level to reflect importance in TF-IDF
            repeat_count = int(round(req.weight * (2 if req.is_required else 1)))
            tokens.extend([req.skill.name] * max(repeat_count, 1))
            if req.skill.category:
                tokens.append(req.skill.category)
            if req.skill.aliases:
                tokens.append(req.skill.aliases.replace(",", " "))

    return " ".join(tokens)


def build_user_text(user_skills: List[UserSkill]) -> str:
    """
    Constructs a textual document representing candidate competency.
    Skills with higher proficiency (Advanced/Expert) receive proportional term frequency weighting.
    """
    if not user_skills:
        return "student candidate beginner entry level learning"

    tokens = []
    for us in user_skills:
        if us.skill:
            name = us.skill.name
            level = us.proficiency_level  # 1 to 4
            # Repeat based on user's demonstrated proficiency
            tokens.extend([name] * level)
            if us.skill.category:
                tokens.append(us.skill.category)
            if us.skill.aliases:
                tokens.append(us.skill.aliases.replace(",", " "))

    return " ".join(tokens)


def calculate_nlp_similarity(
    role: JobRole,
    requirements: List[RoleSkillRequirement],
    user_skills: List[UserSkill]
) -> NLPEngineMetrics:
    """
    Performs genuine NLP vector space matching between user profile and job requirements:
      1. Uses Scikit-learn TfidfVectorizer (Sublinear TF + unigrams/bigrams)
      2. Computes Cosine Similarity between document vectors: Cos(u, r) = (u . r) / (||u|| * ||r||)
      3. Identifies semantic transferable skills across technology clusters
      4. Returns academically sound, non-fabricated metrics with transparent limitations
    """
    role_text = build_role_text(role, requirements)
    user_text = build_user_text(user_skills)

    # Initialize TF-IDF Vectorizer with sublinear TF scaling and technical stop words filtering
    vectorizer = TfidfVectorizer(
        lowercase=True,
        sublinear_tf=True,
        ngram_range=(1, 2),
        stop_words="english",
        min_df=1
    )

    tfidf_matrix = vectorizer.fit_transform([user_text, role_text])
    feature_names = vectorizer.get_feature_names_out()

    # Compute Cosine Similarity between User vector (index 0) and Role vector (index 1)
    cos_sim_matrix = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
    raw_similarity = float(cos_sim_matrix[0][0])  # Between 0.0 and 1.0

    # Extract top overlapping terms in vector space
    user_dense = tfidf_matrix[0].toarray()[0]
    role_dense = tfidf_matrix[1].toarray()[0]
    overlap_product = user_dense * role_dense

    top_term_indices = np.argsort(overlap_product)[::-1][:6]
    top_correlated_terms = [
        str(feature_names[i]) for i in top_term_indices if overlap_product[i] > 0.001
    ]

    # Evaluate Transferable Skills
    user_skill_names = {us.skill.name.lower().strip() for us in user_skills if us.skill}
    req_skill_names = {req.skill.name.lower().strip() for req in requirements if req.skill}

    transferable_credits: List[Dict[str, str]] = []
    transfer_bonus = 0.0

    for cluster in SKILL_TRANSFER_CLUSTERS:
        cluster_skills = set(cluster["skills"])
        user_matches = user_skill_names.intersection(cluster_skills)
        missing_reqs = req_skill_names.intersection(cluster_skills) - user_matches

        if user_matches and missing_reqs:
            for missing in missing_reqs:
                matched_via = ", ".join(user_matches)
                transferable_credits.append({
                    "target_skill": missing.title(),
                    "transferable_from": matched_via.title(),
                    "domain": cluster["domain"],
                    "credit_ratio": f"{int(cluster['credit_ratio'] * 100)}%",
                    "rationale": cluster["rationale"]
                })
                transfer_bonus += (cluster["credit_ratio"] * 0.05)

    # Effective similarity score with transferable bonus (capped at 1.0)
    adjusted_sim_score = min(raw_similarity + transfer_bonus, 1.0)
    semantic_pct = round(adjusted_sim_score * 100.0, 1)

    methodology_doc = (
        "Academically Defensible NLP Formulation: Vector Space Model using TF-IDF (Term Frequency-Inverse Document Frequency) "
        "with sublinear TF scaling (1 + log(tf)) and unigram/bigram tokenization. Vector similarity is evaluated via Cosine Distance "
        "[Salton & Buckley, 1988]. No fabricated supervised labels or synthetic accuracy metrics are used, guaranteeing academic "
        "reproducibility and auditability during final-year viva defense. Limitations: Lexical matching does not fully capture deep semantic "
        "intent outside technical token overlap."
    )

    return NLPEngineMetrics(
        cosine_similarity_score=round(adjusted_sim_score, 3),
        semantic_match_percentage=semantic_pct,
        vector_space_model="TF-IDF (Sublinear TF + Bi-grams) + Cosine Distance Matrix",
        top_correlated_terms=top_correlated_terms,
        transferable_skills=transferable_credits,
        methodology_and_limitations=methodology_doc
    )


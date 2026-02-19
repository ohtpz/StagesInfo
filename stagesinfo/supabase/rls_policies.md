# RLS Policies — StagesInfo
_Last updated: 2026-02-19_

## `public.profiles`
| Policy | CMD | Rule |
|--------|-----|------|
| `profiles_insert_own` | INSERT | `id = auth.uid()` |
| `profiles_select_own_or_admin` | SELECT | `id = auth.uid()` OR `is_admin()` OR company with applicant |
| `profiles_update_own_or_admin` | UPDATE | `id = auth.uid()` OR `is_admin()` |

---

## `public.applications`
| Policy | CMD | Rule |
|--------|-----|------|
| `applications_insert_student_only` | INSERT | `student_id = auth.uid()` AND `has_role('student')` |
| `applications_select_student_company_admin` | SELECT | own application OR admin OR company that owns the offer |
| `applications_update_student_pending_or_admin` | UPDATE | admin OR own pending application |

---

## `public.offers`
| Policy | CMD | Rule |
|--------|-----|------|
| `offers_insert_company_only` | INSERT | `has_role('company')` AND owns the company |
| `offers_select_authenticated` | SELECT | admin OR `status = 'available'` OR own company's offer |
| `offers_select_public_available` | SELECT (anon) | `status = 'available'` |
| `offers_update_company_or_admin` | UPDATE | admin OR own company's offer |
| `offers_delete_company_or_admin` | DELETE | admin OR own company's offer |

---

## `public.companies`
| Policy | CMD | Rule |
|--------|-----|------|
| `companies_insert_own_company_only` | INSERT | `owner_id = auth.uid()` AND `has_role('company')` |
| `companies_select_own_or_admin` | SELECT | `owner_id = auth.uid()` OR admin |
| `companies_update_own_or_admin` | UPDATE | `owner_id = auth.uid()` OR admin |

---

## `public.students`
| Policy | CMD | Rule |
|--------|-----|------|
| `students_insert_own_student_only` | INSERT | `user_id = auth.uid()` AND `has_role('student')` |
| `students_select_own_or_admin` | SELECT | `user_id = auth.uid()` OR admin |
| `students_update_own_or_admin` | UPDATE | `user_id = auth.uid()` OR admin |

---

## `public.skills`
| Policy | CMD | Rule |
|--------|-----|------|
| `skills_select_all` | SELECT (anon + authenticated) | `true` — public |
| `skills_admin_insert` | INSERT | `is_admin()` |
| `skills_admin_update` | UPDATE | `is_admin()` |
| `skills_admin_delete` | DELETE | `is_admin()` |

---

## `public.student_skills`
| Policy | CMD | Rule |
|--------|-----|------|
| `student_skills_select_own_or_admin` | SELECT | `student_id = auth.uid()` OR admin |
| `student_skills_insert_own_or_admin` | INSERT | `student_id = auth.uid()` OR admin |
| `student_skills_update_own_or_admin` | UPDATE | `student_id = auth.uid()` OR admin |
| `student_skills_delete_own_or_admin` | DELETE | `student_id = auth.uid()` OR admin |

---

## `public.offer_skills`
| Policy | CMD | Rule |
|--------|-----|------|
| `offer_skills_select_all` | SELECT (anon + authenticated) | `true` — public |
| `offer_skills_insert_company_or_admin` | INSERT | admin OR company owns the offer |
| `offer_skills_update_company_or_admin` | UPDATE | admin OR company owns the offer |
| `offer_skills_delete_company_or_admin` | DELETE | admin OR company owns the offer |

---

## `public.reviews`
| Policy | CMD | Rule |
|--------|-----|------|
| `reviews_insert_student_only` | INSERT | `has_role('student')` AND own application |
| `reviews_select_admin_only` | SELECT | `is_admin()` only |

---

## `storage.objects` (bucket: `cvs`)
| Policy | CMD | Rule |
|--------|-----|------|
| `cv_insert_owner` | INSERT | path = `{uid}/cv.pdf` |
| `cv_select_owner` | SELECT | path = `{uid}/cv.pdf` |
| `Users can upload their own CVs (PDF Only)` | INSERT | bucket=cvs, name starts with uid, ends with .pdf |
| `Users can view their own CVs` | SELECT | bucket=cvs, name starts with uid |
| `Users can delete their own CVs` | DELETE | bucket=cvs, name starts with uid |
| `Enable insert for authenticated users only` | INSERT | `true` (all authenticated — **redundant with the specific policies above**) |

> ⚠️ There are duplicate/overlapping INSERT policies on `storage.objects`. The generic "Enable insert for authenticated users only" is overly broad.

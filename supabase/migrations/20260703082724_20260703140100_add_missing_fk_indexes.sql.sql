/*
# Add Missing Indexes on Foreign Key Columns

## Performance Improvements
- Add indexes on foreign key columns that are frequently joined
- Improves query performance for joins and lookups
- Reduces sequential scans on high-traffic tables

## Indexes Added
1. accounts.parent_account_id - self-referential FK
2. active_alerts.rule_id - FK to alert_rules
3. ai_agent_collaborations columns - task_id, agent_type_keys
4. ai_agent_permissions.agent_type_key
5. ai_agent_tasks.agent_type_key
6. ai_approval_requests.workflow_id
7. ai_automation_executions columns
8. ai_communications.from_agent_id
9. ai_cost_logs.model_id
10. ai_document_entities.job_id
11. ai_document_jobs.document_id
12. ai_evaluation_results columns
13. ai_feedback.message_id, agent_type_key
14. ai_knowledge_documents.source_id
15. ai_model_health columns
16. ai_models.provider_id
17. ai_orchestration_logs columns
18. ai_rag_citations columns
19. ai_security_events columns
20. ai_session_memory.session_id
21. ai_usage_metrics, summaries columns
22. ai_vision detections/extractions.job_id
23. ai_voice commands/notes/transcriptions.session_id
*/

-- Accounts self-reference
CREATE INDEX IF NOT EXISTS idx_accounts_parent_account_id ON accounts(parent_account_id);

-- Active alerts
CREATE INDEX IF NOT EXISTS idx_active_alerts_rule_id ON active_alerts(rule_id);

-- AI Agent collaborations
CREATE INDEX IF NOT EXISTS idx_ai_agent_collaborations_task_id ON ai_agent_collaborations(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_collaborations_primary_agent ON ai_agent_collaborations(primary_agent_type_key);
CREATE INDEX IF NOT EXISTS idx_ai_agent_collaborations_secondary_agent ON ai_agent_collaborations(secondary_agent_type_key);

-- AI Agent permissions
CREATE INDEX IF NOT EXISTS idx_ai_agent_permissions_agent_type ON ai_agent_permissions(agent_type_key);

-- AI Agent tasks
CREATE INDEX IF NOT EXISTS idx_ai_agent_tasks_agent_type ON ai_agent_tasks(agent_type_key);

-- AI Approval requests
CREATE INDEX IF NOT EXISTS idx_ai_approval_requests_workflow ON ai_approval_requests(workflow_id);

-- AI Automation approvals
CREATE INDEX IF NOT EXISTS idx_ai_automation_approvals_execution ON ai_automation_approvals(execution_id);

-- AI Automation executions
CREATE INDEX IF NOT EXISTS idx_ai_automation_executions_agent ON ai_automation_executions(agent_type_key);
CREATE INDEX IF NOT EXISTS idx_ai_automation_executions_action ON ai_automation_executions(action_key);

-- AI Communications
CREATE INDEX IF NOT EXISTS idx_ai_communications_from_agent ON ai_communications(from_agent_id);

-- AI Content reviews
CREATE INDEX IF NOT EXISTS idx_ai_content_reviews_conversation ON ai_content_reviews(conversation_id);

-- AI Conversation sessions
CREATE INDEX IF NOT EXISTS idx_ai_conversation_sessions_agent ON ai_conversation_sessions(agent_type_key);

-- AI Cost logs
CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_model ON ai_cost_logs(model_id);

-- AI Cost tracking
CREATE INDEX IF NOT EXISTS idx_ai_cost_tracking_agent ON ai_cost_tracking(agent_type_key);

-- AI Document entities
CREATE INDEX IF NOT EXISTS idx_ai_document_entities_job ON ai_document_entities(job_id);

-- AI Document jobs
CREATE INDEX IF NOT EXISTS idx_ai_document_jobs_document ON ai_document_jobs(document_id);

-- AI Evaluation results
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_results_model ON ai_evaluation_results(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_results_prompt ON ai_evaluation_results(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ai_evaluation_results_metric ON ai_evaluation_results(metric_id);

-- AI Feedback
CREATE INDEX IF NOT EXISTS idx_ai_feedback_message ON ai_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_agent ON ai_feedback(agent_type_key);

-- AI Generations
CREATE INDEX IF NOT EXISTS idx_ai_generations_project ON ai_generations(project_id);

-- AI Hallucination reports
CREATE INDEX IF NOT EXISTS idx_ai_hallucination_reports_message ON ai_hallucination_reports(message_id);

-- AI Knowledge documents
CREATE INDEX IF NOT EXISTS idx_ai_knowledge_documents_source ON ai_knowledge_documents(source_id);

-- AI Model health
CREATE INDEX IF NOT EXISTS idx_ai_model_health_provider ON ai_model_health(provider_id);
CREATE INDEX IF NOT EXISTS idx_ai_model_health_model ON ai_model_health(model_id);

-- AI Models
CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider_id);

-- AI Orchestration logs
CREATE INDEX IF NOT EXISTS idx_ai_orchestration_logs_prompt ON ai_orchestration_logs(prompt_id);
CREATE INDEX IF NOT EXISTS idx_ai_orchestration_logs_model ON ai_orchestration_logs(model_id);

-- AI RAG citations
CREATE INDEX IF NOT EXISTS idx_ai_rag_citations_chunk ON ai_rag_citations(chunk_id);
CREATE INDEX IF NOT EXISTS idx_ai_rag_citations_query ON ai_rag_citations(query_id);
CREATE INDEX IF NOT EXISTS idx_ai_rag_citations_document ON ai_rag_citations(document_id);

-- AI RAG queries
CREATE INDEX IF NOT EXISTS idx_ai_rag_queries_agent ON ai_rag_queries(agent_type_key);

-- AI Recommendations
CREATE INDEX IF NOT EXISTS idx_ai_recommendations_agent ON ai_recommendations(agent_id);

-- AI Reports
CREATE INDEX IF NOT EXISTS idx_ai_reports_agent ON ai_reports(agent_id);

-- AI Search queries
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_session ON ai_search_queries(session_id);

-- AI Security events
CREATE INDEX IF NOT EXISTS idx_ai_security_events_user ON ai_security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_security_events_reviewed_by ON ai_security_events(reviewed_by);

-- AI Session memory
CREATE INDEX IF NOT EXISTS idx_ai_session_memory_session ON ai_session_memory(session_id);

-- AI Usage metrics
CREATE INDEX IF NOT EXISTS idx_ai_usage_metrics_agent ON ai_usage_metrics(agent_type_key);

-- AI Usage summaries
CREATE INDEX IF NOT EXISTS idx_ai_usage_summaries_model ON ai_usage_summaries(model_id);

-- AI Vision detections/extractions
CREATE INDEX IF NOT EXISTS idx_ai_vision_detections_job ON ai_vision_detections(job_id);
CREATE INDEX IF NOT EXISTS idx_ai_vision_extractions_job ON ai_vision_extractions(job_id);

-- AI Voice commands/notes/transcriptions
CREATE INDEX IF NOT EXISTS idx_ai_voice_commands_session ON ai_voice_commands(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_notes_session ON ai_voice_notes(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_transcriptions_session ON ai_voice_transcriptions(session_id);

-- Agent availability
CREATE INDEX IF NOT EXISTS idx_agent_availability_conversation ON agent_availability(current_conversation_id);

-- AI Mobile assistant history
CREATE INDEX IF NOT EXISTS idx_ai_mobile_assistant_device ON ai_mobile_assistant_history(device_id);

-- Additional frequently accessed FK columns (verified to exist)
CREATE INDEX IF NOT EXISTS idx_conversation_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_sessions_user ON ai_conversation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_voice_sessions_user ON ai_voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_search_queries_user ON ai_search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user ON ai_usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cost_logs_user ON ai_cost_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user ON ai_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_orchestration_logs_user ON ai_orchestration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_mobile_assistant_user ON ai_mobile_assistant_history(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_user ON activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_project_members_project ON project_members(project_id);
CREATE INDEX IF NOT EXISTS idx_task_comments_task ON task_comments(task_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_meeting_participants_user ON meeting_participants(user_id);

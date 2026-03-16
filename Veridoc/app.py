import streamlit as st
from main import get_response

st.set_page_config(page_title="Air India Assistant", layout="wide")

st.title("✈️ Air India Chat Assistant")
st.markdown("Ask any question about Air India based on the provided documents.")

if "messages" not in st.session_state:
    st.session_state.messages = []

if st.button("Clear chat"):
    st.session_state.messages = []
    st.rerun()

for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

question = st.chat_input("Ask a question about Air India")

if question:
    st.session_state.messages.append({"role": "user", "content": question})

    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant"):
        with st.spinner("Generating answer..."):
            try:
                result = get_response(question, st.session_state.messages[:-1])
                answer = result["output"]["message"]["content"][0]["text"]
                st.markdown(answer)
                st.session_state.messages.append({"role": "assistant", "content": answer})
            except Exception as e:
                st.error(f"An error occurred: {e}")

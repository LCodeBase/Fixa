import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Header from '../components/Header';

const TermsOfServiceScreen = () => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header title="Termos de Serviço" showBackButton={true} />
      <ScrollView style={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Termos de Serviço do Fixa
        </Text>
        <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
          Última atualização: {new Date().toLocaleDateString()}
        </Text>
        
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Ao acessar ou usar o aplicativo Fixa, você concorda em cumprir estes termos de serviço. Por favor, leia-os cuidadosamente.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          1. Uso do Serviço
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          O Fixa é um aplicativo de estudo com repetição espaçada que permite aos usuários criar e estudar flashcards. Você deve ter pelo menos 13 anos de idade para usar este serviço. Ao usar nosso serviço, você concorda em não usar o Fixa para qualquer finalidade ilegal ou proibida por estes termos.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          2. Contas
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Quando você cria uma conta conosco, você deve fornecer informações precisas e completas. Você é responsável por manter a segurança de sua conta e senha. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          3. Conteúdo do Usuário
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Você mantém todos os direitos sobre o conteúdo que você cria e compartilha no Fixa. Ao publicar conteúdo, você concede ao Fixa uma licença mundial, não exclusiva, isenta de royalties para usar, modificar, executar publicamente, exibir publicamente e distribuir seu conteúdo em conexão com o serviço.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          4. Modificações do Serviço
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, o serviço (ou qualquer parte dele) com ou sem aviso prévio. Não seremos responsáveis perante você ou terceiros por qualquer modificação, suspensão ou descontinuação do serviço.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          5. Limitação de Responsabilidade
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Em nenhum caso o Fixa, seus diretores, funcionários ou agentes serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos decorrentes de ou relacionados ao seu uso do serviço.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          6. Alterações a estes Termos
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Reservamo-nos o direito, a nosso exclusivo critério, de modificar ou substituir estes termos a qualquer momento. Se uma revisão for material, tentaremos fornecer um aviso com pelo menos 30 dias de antecedência antes que quaisquer novos termos entrem em vigor.
        </Text>
        
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          7. Contato
        </Text>
        <Text style={[styles.paragraph, { color: theme.colors.text }]}>
          Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em contato@fixa-app.com.
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
});

export default TermsOfServiceScreen;
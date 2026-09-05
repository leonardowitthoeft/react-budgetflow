import styles from './RepetitionNote.module.css'

type Props = {
  repeticao: 'installment' | 'recurring'
}

export function RepetitionNote({ repeticao }: Props) {
  if (repeticao === 'installment') {
    return (
      <p className={styles.note}>
        O valor é o de <strong>cada parcela</strong>, não o total da compra.
        Uma compra no dia 31 encaixa no último dia dos meses mais curtos e
        volta ao 31 depois.
      </p>
    )
  }

  if (repeticao === 'recurring') {
    return (
      <p className={styles.note}>
        Será criada uma entrada para cada mês durante o período especificado.
        A data da entrada será mantida (ex: dia 5 cada mês).
      </p>
    )
  }

  return null
}
